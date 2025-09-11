import React from 'react';

function ScreenShot() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '2rem',
      }}
    >
      <p>Press Esc to cancel</p>
    </div>
  );
}

export default ScreenShot;
