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

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH["Bills"]);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      expect(windowIcon.classList).toContain("active-icon");

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("Then when I click on an eye icon the modal opens", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({data: bills})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
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
      expect($.fn.modal).toHaveBeenCalledWith("show");
    })
    test("Then when I click on the 'Nouvelle note de frais' button, onNavigate should be called with 'NewBill'", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
  
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate = jest.fn();
  
      document.body.innerHTML = BillsUI({ data: bills });
      const store = null
      const billsPage = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

      const handleClickNewBill = jest.fn(billsPage.handleClickNewBill);

      const newBillButton = screen.getByTestId('btn-new-bill');
      newBillButton.addEventListener("click", (e) => {handleClickNewBill()})
      userEvent.click(newBillButton);
  
      expect(handleClickNewBill).toHaveBeenCalled();
      expect(window.onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
    })
  })
})
