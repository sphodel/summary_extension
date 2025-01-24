import React from 'react'
import './style.css'

const Popup = () => {
  return (
    <div className="popup-container">
      <div className="controls">
        <button id="copy">复制内容</button>
        <button id="save">保存为文件</button>
      </div>
      <div id="content" className="content"></div>
    </div>
  )
}

export default Popup 