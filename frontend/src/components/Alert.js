import { useState } from 'react'

export function useAlert() {
  const [alert, setAlert] = useState(null)

  const showAlert = (message, onCloseCallback = null) => {
    setAlert({ message, onClose: onCloseCallback })
  }

  const closeAlert = () => {
    const callbackToExecute = alert?.onClose
    setAlert(null) 

    if (callbackToExecute) {
      callbackToExecute()
    }
  }

  const AlertComponent = () => (
    alert && (
        <div className="modalOverlay">
            <div className="alertModalContent"> 
                <button className="alertCloseButton" onClick={closeAlert}>x</button>
                <div className="alertMessage">{alert.message}</div>
            </div>
        </div>
    )
  )

  return {AlertComponent, showAlert}
}