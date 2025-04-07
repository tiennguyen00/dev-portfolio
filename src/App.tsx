import CanvasPage from "./components/Canvas";
import Contents from "./components/Contents";
function App() {
  return (
    <div className="w-[100dvw] min-h-[100dvh] relative">
      <Contents />
      <CanvasPage />
    </div>
  );
}

export default App;
