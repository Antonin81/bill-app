/**
 * @jest-environment jsdom
 */

import { waitFor, screen, getByTestId, fireEvent } from "@testing-library/dom"
import { ROUTES_PATH } from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)

window.alert = jest.fn()

describe("Given I am connected as an employee on NewBill Page", () => {
  describe("When the page has been loaded", () => {
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
    test("Then new bill icon in vertical layout should be highlighted", async () => {     
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = getByTestId(document, 'icon-mail')
      expect(mailIcon.classList).toContain("active-icon")
    })
    test("Then bill icon in vertical layout should not be highlighted", async ()=>{
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = getByTestId(document, 'icon-window')
      expect(windowIcon.classList).not.toContain("active-icon")
    })
  })

  describe("When I am completing the form", () => {
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
    test("Then i upload a good file and it should be uploaded", async ()=>{
      window.onNavigate(ROUTES_PATH.NewBill)
      const newBillPage = new NewBill({
        document, onNavigate, mockStore, localStorage: window.localStorage
      })
      await waitFor(() => screen.getByTestId('file'))
      let fileInput = screen.getByTestId('file')
      const handleChangeFile = jest.fn(newBillPage.handleChangeFile)
      fileInput.addEventListener("change",(e) => {handleChangeFile(e)})
      fireEvent.change(fileInput, {
        target: {
          files: [new File(['(⌐□_□)'], 'image.png', {type: 'image/png'})],
        },
      })
      expect(handleChangeFile).toHaveBeenCalled()
      handleChangeFile.mockClear()
      const uploadedFiles = fileInput.files
      expect(uploadedFiles.length).toEqual(1)
      expect(uploadedFiles[0].name).toEqual("image.png")
    })
    test("Then i upload a wrong file and it should not be uploaded", async ()=>{
      const store = null
      const newBillPage = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('file'))
      let fileInput = getByTestId(document.body, 'file')
      const handleChangeFile = jest.fn(newBillPage.handleChangeFile)
      fileInput.addEventListener("change",(e) => {handleChangeFile(e)})
      fireEvent.change(fileInput, {
        target: {
          files: [new File(['(⌐□_□)'], 'image.json', {type: 'application/json'})],
        },
      })
      expect(handleChangeFile).toHaveBeenCalled()
      handleChangeFile.mockClear()
      fileInput = getByTestId(document.body, 'file')
      const uploadedFiles = fileInput.files
      expect(uploadedFiles.length).toEqual(0)
    })
    test("Then I have required fields to fill", async ()=>{
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId("datepicker"))
      await waitFor(() => screen.getByTestId("amount"))
      await waitFor(() => screen.getByTestId("pct"))
      await waitFor(() => screen.getByTestId('file'))
      const datePickerInput = screen.getByTestId("datepicker")
      const amountInput = screen.getByTestId("amount")
      const pctInput = screen.getByTestId("pct")
      const fileInput = screen.getByTestId('file')
      expect(datePickerInput.required).toBeTruthy()
      expect(amountInput.required).toBeTruthy()
      expect(pctInput.required).toBeTruthy()
      expect(fileInput.required).toBeTruthy()
    })
    test("Then i complete and submit the form and it should be sent", async ()=>{
      const store = null
      window.onNavigate(ROUTES_PATH.NewBill)
      const newBillPage = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      await waitFor(() => screen.getByTestId("form-new-bill"))
      await waitFor(() => screen.getByTestId("expense-type"))
      await waitFor(() => screen.getByTestId("expense-name"))
      await waitFor(() => screen.getByTestId("datepicker"))
      await waitFor(() => screen.getByTestId("amount"))
      await waitFor(() => screen.getByTestId("vat"))
      await waitFor(() => screen.getByTestId("pct"))
      await waitFor(() => screen.getByTestId("commentary"))
      await waitFor(() => screen.getByTestId('file'))
      const formInput = screen.getByTestId("form-new-bill")
      const expenseTypeInput = screen.getByTestId("expense-type")
      const expenseNameInput = screen.getByTestId("expense-name")
      const datePickerInput = screen.getByTestId("datepicker")
      const amountInput = screen.getByTestId("amount")
      const vatInput = screen.getByTestId("vat")
      const pctInput = screen.getByTestId("pct")
      const commentaryInput = screen.getByTestId("commentary")
      const fileInput = screen.getByTestId('file')
      fireEvent.change(expenseTypeInput, {target: {value: "Restaurants et bars"}})
      expect(expenseTypeInput.children[1].selected).toBeTruthy()
      fireEvent.change(expenseNameInput, {target: {value: "Vol Paris Londres"}})
      expect(expenseNameInput.value).toEqual("Vol Paris Londres")
      fireEvent.change(datePickerInput, {target: {value: '2020-05-24'}})
      expect(datePickerInput.value).toEqual("2020-05-24")
      fireEvent.change(amountInput, {target: {value: 150}})
      expect(parseInt(amountInput.value)).toEqual(150)
      fireEvent.change(vatInput, {target: {value: 30}})
      expect(parseInt(vatInput.value)).toEqual(30)
      fireEvent.change(pctInput, {target: {value: 20}})
      expect(parseInt(pctInput.value)).toEqual(20)
      fireEvent.change(commentaryInput, {target: {value: "Pas de commentaires"}})
      expect(commentaryInput.value).toEqual("Pas de commentaires")
      const handleChangeFile = jest.fn(newBillPage.handleChangeFile)
      fileInput.addEventListener("change", (e) => {handleChangeFile(e)})
      fireEvent.change(fileInput, {
        target: {
          files: [new File(['(⌐□_□)'], 'image.png', {type: 'image/png'}, {path: "~/truc/image.png"})],
        },
      })
      expect(fileInput.files[0].name).toEqual('image.png')
      handleChangeFile.mockClear()
      const handleSubmit = jest.fn(newBillPage.handleSubmit)
      formInput.addEventListener("submit", (e) => {handleSubmit(e)})
      fireEvent.submit(formInput)
      expect(handleSubmit).toHaveBeenCalled()
      handleSubmit.mockClear()
      await waitFor(()=> screen.getByText(/Mes notes de frais/))
      const BillsPageTitle = screen.getByText(/Mes notes de frais/)
      expect(BillsPageTitle).toBeTruthy()
    })
  })
})

//TEST API POST METHOD

describe("Given I am connected as an employee on NewBill Page", () => {
  describe("When an error occurs on API", ()=>{
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
      jest.spyOn(mockStore, "bills")
    })
    test("fails with 404 message error", async () => {
      const consoleSpy = jest.spyOn(console, "error")
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.NewBill)
      const newBillPage = new NewBill({
        document, onNavigate, mockStore, localStorage: window.localStorage
      })
      await waitFor(() => screen.getByTestId('file'))
      const fileInput = screen.getByTestId('file')
      const handleChangeFile = jest.fn(newBillPage.handleChangeFile)
      fileInput.addEventListener("change", (e) => {handleChangeFile(e)})
      fireEvent.change(fileInput, {
        target: {
          files: [new File(['(⌐□_□)'], 'image.png', {type: 'image/png'}, {path: "~/truc/image.png"})],
        },
      })
      handleChangeFile.mockClear()
      await new Promise(process.nextTick)
      expect(consoleSpy).toHaveBeenCalled()
      const consoleError = consoleSpy.mock.calls[0][0]
      expect(consoleError.toString()).toEqual("Error: Erreur 404")
      consoleSpy.mockClear()
    })
    test("fails with 500 message error", async () => {
      const consoleSpy = jest.spyOn(console, "error")
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      window.onNavigate(ROUTES_PATH.NewBill)
      const newBillPage = new NewBill({
        document, onNavigate, mockStore, localStorage: window.localStorage
      })
      await waitFor(() => screen.getByTestId('file'))
      const fileInput = screen.getByTestId('file')
      const handleChangeFile = jest.fn(newBillPage.handleChangeFile)
      fileInput.addEventListener("change", (e) => {handleChangeFile(e)})
      fireEvent.change(fileInput, {
        target: {
          files: [new File(['(⌐□_□)'], 'image.png', {type: 'image/png'}, {path: "~/truc/image.png"})],
        },
      })
      handleChangeFile.mockClear()
      await new Promise(process.nextTick)
      expect(consoleSpy).toHaveBeenCalled()
      const consoleError = consoleSpy.mock.calls[0][0]
      expect(consoleError.toString()).toEqual("Error: Erreur 500")
      consoleSpy.mockClear()
    })
  })
})