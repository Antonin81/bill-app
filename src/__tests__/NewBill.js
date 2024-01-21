/**
 * @jest-environment jsdom
 */

import { waitFor, screen, getByTestId, fireEvent } from "@testing-library/dom"
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";
import { ROUTES_PATH } from "../constants/routes.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(()=>{
      document.body.innerHTML="";
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
  
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      document.body.innerHTML = NewBillUI();
      window.onNavigate(ROUTES_PATH["NewBill"]);
    })
    test("Then new bill icon in vertical layout should be highlighted", async () => {     
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = getByTestId(document, 'icon-mail')
      expect(mailIcon.classList).toContain("active-icon")
    })
    test("Then bill icon in vertical layout should not be highlighted", async ()=>{
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = getByTestId(document, 'icon-window')
      expect(windowIcon.classList).not.toContain("active-icon")
    })

    test("Then when i upload a good file, it is uploaded", async ()=>{
      const store = null
      const newBillPage = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const handleChangeFile = jest.fn(newBillPage.handleChangeFile);
      await waitFor(() => screen.getByTestId('file'))
      let fileInput = getByTestId(document.body, 'file');
      fileInput.addEventListener("change",(e) => {handleChangeFile(e)})
      fireEvent.change(fileInput, {
        target: {
          files: [new File(['(⌐□_□)'], 'image.png', {type: 'image/png'})],
        },
      });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files.length).toEqual(1)
    })

    test("Then when i upload a wrong file, it is not uploaded", async ()=>{
      const store = null
      const newBillPage = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const handleChangeFile = jest.fn(newBillPage.handleChangeFile);
      await waitFor(() => screen.getByTestId('file'))
      let fileInput = getByTestId(document.body, 'file');
      fileInput.addEventListener("change",(e) => {handleChangeFile(e)})
      fireEvent.change(fileInput, {
        target: {
          files: [new File(['(⌐□_□)'], 'image.json', {type: 'application/json'})],
        },
      });
      expect(handleChangeFile).toHaveBeenCalled();
      fileInput = getByTestId(document.body, 'file');
      expect(fileInput.files.length).toEqual(0);
    })
    
    test("Then when i complete and submit the form then it is sent", async ()=>{
      const store = null
      window.onNavigate = jest.fn();
      const newBillPage = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })

      await waitFor(() => screen.getByTestId("form-new-bill"));
      await waitFor(() => screen.getByTestId("expense-type"));
      await waitFor(() => screen.getByTestId("expense-name"));
      await waitFor(() => screen.getByTestId("datepicker"));
      await waitFor(() => screen.getByTestId("amount"));
      await waitFor(() => screen.getByTestId("vat"));
      await waitFor(() => screen.getByTestId("pct"));
      await waitFor(() => screen.getByTestId("commentary"));
      await waitFor(() => screen.getByTestId('file'));

      const formInput = screen.getByTestId("form-new-bill");
      const expenseTypeInput = screen.getByTestId("expense-type");
      const expenseNameInput = screen.getByTestId("expense-name");
      const datePickerInput = screen.getByTestId("datepicker");
      const amountInput = screen.getByTestId("amount");
      const vatInput = screen.getByTestId("vat");
      const pctInput = screen.getByTestId("pct");
      const commentaryInput = screen.getByTestId("commentary");
      const fileInput = screen.getByTestId('file');

      fireEvent.change(expenseTypeInput, {target: {value: "Restaurants et bars"}});
      expect(expenseTypeInput.children[1].selected).toBeTruthy();
      fireEvent.change(expenseNameInput, {target: {value: "Vol Paris Londres"}});
      expect(expenseNameInput.value).toEqual("Vol Paris Londres");
      fireEvent.change(datePickerInput, {target: {value: '2020-05-24'}});
      expect(datePickerInput.value).toEqual("2020-05-24");
      fireEvent.change(amountInput, {target: {value: 150}});
      expect(parseInt(amountInput.value)).toEqual(150);
      fireEvent.change(vatInput, {target: {value: 30}});
      expect(parseInt(vatInput.value)).toEqual(30);
      fireEvent.change(pctInput, {target: {value: 20}});
      expect(parseInt(pctInput.value)).toEqual(20);
      fireEvent.change(commentaryInput, {target: {value: "Pas de commentaires"}});
      expect(commentaryInput.value).toEqual("Pas de commentaires");

      const handleChangeFile = jest.fn(newBillPage.handleChangeFile);
      fileInput.addEventListener("change", (e) => {handleChangeFile(e)})

      fireEvent.change(fileInput, {
        target: {
          files: [new File(['(⌐□_□)'], 'image.png', {type: 'image/png'})],
        },
      });
      expect(fileInput.files[0].name).toEqual('image.png');

      const handleSubmit = jest.fn(newBillPage.handleSubmit);
      formInput.addEventListener("submit", (e) => {handleSubmit(e)})
      fireEvent.submit(formInput);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    })

  })
})
