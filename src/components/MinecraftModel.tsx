import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface MinecraftModelProps {
  skinTexture: THREE.Texture | null;
  onPixelPaint?: (face: string, x: number, y: number) => void;
  selectedColor: string;
  currentTool: string;
  isDrawing: boolean;
  setIsDrawing: (value: boolean) => void;
}

const MinecraftCharacter = ({ 
  skinTexture, 
  onPixelPaint, 
  selectedColor, 
  currentTool,
  isDrawing,
  setIsDrawing 
}: MinecraftModelProps) => {
  const headRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t) * 0.3;
    if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t + Math.PI) * 0.3;
    if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t + Math.PI) * 0.3;
    if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t) * 0.3;
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDrawing(true);
    handlePaint(e);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDrawing) return;
    e.stopPropagation();
    handlePaint(e);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handlePaint = (e: ThreeEvent<PointerEvent>) => {
    if (!onPixelPaint || currentTool !== 'pencil') return;

    const uv = e.uv;
    if (!uv) return;

    const x = Math.floor(uv.x * 64);
    const y = Math.floor((1 - uv.y) * 64);

    const face = e.object.userData.face || 'body';
    onPixelPaint(face, x, y);
  };

  const material = skinTexture 
    ? new THREE.MeshStandardMaterial({ 
        map: skinTexture, 
        transparent: false 
      })
    : new THREE.MeshStandardMaterial({ color: '#9b87f5' });

  return (
    <group position={[0, 0, 0]}>
      <mesh 
        ref={headRef} 
        position={[0, 2, 0]}
        userData={{ face: 'head' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>

      <mesh 
        ref={bodyRef} 
        position={[0, 0.75, 0]}
        userData={{ face: 'body' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <boxGeometry args={[1, 1.5, 0.5]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      <mesh 
        ref={rightArmRef} 
        position={[0.75, 0.75, 0]}
        userData={{ face: 'rightArm' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <boxGeometry args={[0.5, 1.5, 0.5]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      <mesh 
        ref={leftArmRef} 
        position={[-0.75, 0.75, 0]}
        userData={{ face: 'leftArm' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <boxGeometry args={[0.5, 1.5, 0.5]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      <mesh 
        ref={rightLegRef} 
        position={[0.25, -0.75, 0]}
        userData={{ face: 'rightLeg' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <boxGeometry args={[0.5, 1.5, 0.5]} />
        <meshStandardMaterial color="#404040" />
      </mesh>

      <mesh 
        ref={leftLegRef} 
        position={[-0.25, -0.75, 0]}
        userData={{ face: 'leftLeg' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <boxGeometry args={[0.5, 1.5, 0.5]} />
        <meshStandardMaterial color="#404040" />
      </mesh>
    </group>
  );
};

export const MinecraftModel = (props: MinecraftModelProps) => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [3, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <MinecraftCharacter {...props} />
        <OrbitControls 
          enablePan={false} 
          minDistance={3} 
          maxDistance={10}
          target={[0, 0.5, 0]}
        />
      </Canvas>
    </div>
  );
};

export default MinecraftModel;
