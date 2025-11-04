import { Rnd } from "react-rnd";

export default function AppWindow({ children }: {children:any}) {
  return (
    <Rnd
      default={{
        x: 200,
        y: 200,
        width: 500,
        height: 300,
      }}
      bounds="window"
      minWidth={300}
      minHeight={200}
      className="app-window"
    >
      {children}
    </Rnd>
  );
}


