import { Layout } from "@/app/Layout";
import { useDevices } from "@/features/devices/hooks/useDevices";
import { DeviceSelection } from "@/features/devices/components/DeviceSelection";
import { RawPreview } from "@/features/devices/components/RawPreview";
function App() {
  const {
    state: deviceState,
    availableCameras,
    availableMics,
    selectedCameraId,
    selectedMicId,
    requestCamera,
    requestMicrophone,
    stopCamera,
    stopMicrophone
  } = useDevices();

  return (
    <Layout>
      <section className="flex-1 flex flex-col relative w-full h-full min-h-[400px]">
        <RawPreview camera={deviceState.camera} />
      </section>

      <aside className="w-full md:w-80 flex flex-col gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col">
          <DeviceSelection 
            state={deviceState}
            availableCameras={availableCameras}
            availableMics={availableMics}
            selectedCameraId={selectedCameraId}
            selectedMicId={selectedMicId}
            onRequestCamera={requestCamera}
            onRequestMicrophone={requestMicrophone}
            onStopCamera={stopCamera}
            onStopMicrophone={stopMicrophone}
          />
        </div>
      </aside>
    </Layout>
  );
}

export default App;
