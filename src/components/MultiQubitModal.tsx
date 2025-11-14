import React, { useState } from 'react'

interface multiQubitProps {
  onClose: () => void;
  onConfirm: (control: number, targer: number) => void;
  lines: Array<{id: string; name: string}>;
  currentLine?: number;
}
// { onClose, onConfirm, lines, currentLine }: multiQubitProps
const MultiQubitModal = ({onClose, onConfirm, lines, currentLine}: multiQubitProps) => {
  const [control, setControl] = useState(currentLine);
  const [target, setTarget] = useState(currentLine === 0 ? 1 : 0);

  return (
    <>
    {/* background blur */}
      <div className='absolute bg-white/30 h-screen w-screen top-0 left-0 z-20 backdrop-blur-[1px]'>
        {/* main containter */}
        <div className='flex items-center justify-center h-full w-full'>
          <div className='flex flex-col border border-black/20 rounded-lg bg-white h-[15rem] w-1/5'>
            <div className='flex flex-col justify-center p-6 h-full '>
              <div>
                <label htmlFor="">Control: </label>
                <select 
                  className="border border-black/20 rounded-lg px-2 py-1 w-4/5"
                  value={control}
                  onChange={(e) => setControl(Number(e.target.value))}
                >
                  {lines.map((line, index) => (
                    <option key={line.id} value={index}>
                      {line.name}
                    </option>
                  ))};
                </select>
              </div>
              <div>
                <label htmlFor="" className='mr-[.6rem]' >Target: </label>
                <select 
                  className="border border-black/20 rounded-lg px-2 py-1 w-4/5"
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                >
                  {lines.map((line, index) => (
                    <option key={line.id} value={index} disabled={index === control}>
                      {line.name}
                    </option>
                  ))};
                </select>
              </div>
            </div>
            {/* Confirm/Cancel */}
            <div className='flex gap-4 px-12 pl-40 py-4 border-t border-black/20'>
              <button className='bg-black text-white border border-black/20 rounded-lg px-4 py-2 cursor-pointer' onClick={() => onConfirm(control, target)}>Confirm</button>
              <button className='border border-black/20 rounded-lg px-4 py-2 cursor-pointer' onClick={onClose}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MultiQubitModal