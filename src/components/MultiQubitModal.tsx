import React, { useState } from 'react'

interface multiQubitProps {
  onClose: () => void;
  onConfirm: (control: number, targer: number) => void;
  lines: Array<{id: string; name: string}>;
  currentLine: number;
}
// { onClose, onConfirm, lines, currentLine }: multiQubitProps
const MultiQubitModal = () => {
  //const [control, setControl] = useState(currentLine);
  //const [target, setTarget] = useState(currentLine === 0 ? 1 : 0);

  return (
    <>
    {/* background blur */}
      <div className='absolute bg-white/30 h-screen w-screen top-0 left-0 z-20 backdrop-blur-[1px]'>
        {/* main containter */}
        <div className='flex items-center justify-center h-full w-full'>
          <div className='flex flex-col border border-black/20 rounded-lg bg-white h-1/5 w-1/5'>
            <div className='flex flex-col h-full'>
              <label htmlFor="">Target: </label>
              <input type="number" />
              <label htmlFor="">Control: </label>
              <input type="number" />
            </div>
            {/* Confirm/Cancel */}
            <div className='flex gap-4 px-12 pl-40 pb-4'>
              <button className='bg-black text-white border border-black/20 rounded-lg px-4 py-2 cursor-pointer'>Confirm</button>
              <button className='border border-black/20 rounded-lg px-4 py-2 cursor-pointer'>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MultiQubitModal