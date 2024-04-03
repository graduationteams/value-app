import { Drawer } from "vaul";

export function MyDrawer({
  children,
  isOpen,
  onclose,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onclose: () => void;
}) {
  return (
    <Drawer.Root
      open={isOpen}
      onClose={() => {
        onclose();
      }}
      onOpenChange={(open) => {
        if (!open) {
          onclose();
        }
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black-B200/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 flex flex-col rounded-t-[10px] bg-white-W75">
          <div className="mx-auto mb-8 mt-4 h-1.5 w-24 flex-shrink-0 rounded-full bg-zinc-300" />

          <div>{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
export default MyDrawer;
