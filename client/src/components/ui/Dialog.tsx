import { cn } from '@/lib/cn';
import { useEffect, useRef } from 'react';

function Dialog({
  className,
  closedby = 'any',
  open,
  ...props
}: React.ComponentProps<'dialog'>) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(className)}
      {...props}
    />
  );
}

export { Dialog };

// export function Example() {
//   const [open, setOpen] = useState(false);

//   return (
//     <div>
//       <button
//         onClick={() => setOpen(true)}
//         className="px-4 py-2 bg-blue-600 text-white rounded-lg"
//       >
//         Open Dialog
//       </button>

//       <Dialog open={open} onClose={() => setOpen(false)}>
//         <p className="mb-4">This is your dialog content.</p>
//         <button
//           onClick={() => setOpen(false)}
//           className="px-4 py-2 bg-gray-200 rounded-lg"
//         >
//           Close
//         </button>
//       </Dialog>
//     </div>
//   );
// }
