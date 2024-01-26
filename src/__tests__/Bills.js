/**
 * @jest-environment jsdom
 */

import {screen, waitFor, getAllByTestId, getByTestId, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee on Bills page", () => {
  describe("When the page is loaded", () => {
    beforeEach(()=>{
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      document.body.innerHTML=""
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("Then bill icon in vertical layout should be highlighted", async () => {

      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      expect(windowIcon.classList).toContain("active-icon");

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({data : bills})
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When I click on an eye icon",()=>{
    test("Then the modal should open", async () => {
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      document.body.innerHTML=""
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()

      document.body.innerHTML = BillsUI({data: bills})
      const store = null
      const billsPage = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

      $.fn.modal = jest.fn();
      const handleClickIconEye = jest.fn(billsPage.handleClickIconEye)
      const eyes = screen.getAllByTestId('icon-eye')
      eyes[0].addEventListener('click', (e) => {handleClickIconEye(e.target)})
      userEvent.click(eyes[0])
      expect(handleClickIconEye).toHaveBeenCalled()
      handleClickIconEye.mockClear();
      expect($.fn.modal).toHaveBeenCalledWith("show");
      $.fn.modal.mockClear();
    })
  })
  describe("When I click on the 'Nouvelle note de frais' button",()=>{
    test("Then we should be redirected to NewBill", async () => {
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      document.body.innerHTML=""
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()

      window.onNavigate(ROUTES_PATH.Bills);
  
      const store = null
      const billsPage = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

      const handleClickNewBill = jest.fn(billsPage.handleClickNewBill);

      await waitFor(()=>screen.getByTestId('btn-new-bill'));
      const newBillButton = screen.getByTestId('btn-new-bill');
      newBillButton.addEventListener("click", (e) => {handleClickNewBill()})
      fireEvent.click(newBillButton);
  
      expect(handleClickNewBill).toHaveBeenCalled();
      handleClickNewBill.mockClear()
      await waitFor(()=> screen.getByTestId("form-new-bill"));
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    })
  })
})

//TEST API GET METHOD

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getAllByTestId("icon-eye")).toBeTruthy()
    })
  })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      document.body.innerHTML=""
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches bills from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
    test("fetches bills from an API and the data are corrupted", async () => {

      const wrongFormatDate = "date au mauvais format";

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.resolve(
              [{
                "id": "47qAXb6fIm2zOKkLzMro",
                "vat": "80",
                "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                "status": "pending",
                "type": "Hôtel et logement",
                "commentary": "séminaire billed",
                "name": "encore",
                "fileName": "preview-facture-free-201801-pdf-1.jpg",
                "date": wrongFormatDate,
                "amount": 400,
                "commentAdmin": "ok",
                "email": "a@a",
                "pct": 20
              }]
            );
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      await waitFor(()=>screen.getByTestId("icon-eye"));
      expect(screen.getByTestId("icon-eye").parentElement.parentElement.parentElement.children[2].textContent).toEqual(wrongFormatDate);
    })
  })
})