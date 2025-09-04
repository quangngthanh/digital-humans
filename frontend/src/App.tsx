import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "@/components/Experience";
import { UI } from "@/components/UI";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Loader />
      <Leva hidden={process.env.NODE_ENV === 'production'} />
      <UI />
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 1], fov: 30 }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <Experience />
      </Canvas>
    </ErrorBoundary>
  );
}

export default App;
