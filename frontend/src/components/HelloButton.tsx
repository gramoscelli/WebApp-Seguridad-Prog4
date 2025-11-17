import { useState } from 'react';

export default function HelloButton() {
  const [showMessage, setShowMessage] = useState(false);

  const handleClick = () => {
    setShowMessage(!showMessage);
  };

  return (
    <div>
      <button onClick={handleClick}>
        Mostrar Mensaje
      </button>
      {showMessage && <p>Hola Mundo</p>}
    </div>
  );
}
