
import type { GLTF } from "three-stdlib";
import type * as THREE from "three";

export type GLTFResult = GLTF & {
    nodes: {
        Hips: THREE.Bone;
        Wolf3D_Body: THREE.SkinnedMesh;
        Wolf3D_Outfit_Bottom: THREE.SkinnedMesh;
        Wolf3D_Outfit_Footwear: THREE.SkinnedMesh;
        Wolf3D_Outfit_Top: THREE.SkinnedMesh;
        Wolf3D_Hair: THREE.SkinnedMesh;
        EyeLeft: THREE.SkinnedMesh;
        EyeRight: THREE.SkinnedMesh;
        Wolf3D_Head: THREE.SkinnedMesh;
        Wolf3D_Teeth: THREE.SkinnedMesh;
    };
    materials: {
        Wolf3D_Body: THREE.MeshStandardMaterial;
        Wolf3D_Outfit_Bottom: THREE.MeshStandardMaterial;
        Wolf3D_Outfit_Footwear: THREE.MeshStandardMaterial;
        Wolf3D_Outfit_Top: THREE.MeshStandardMaterial;
        Wolf3D_Hair: THREE.MeshStandardMaterial;
        Wolf3D_Eye: THREE.MeshStandardMaterial;
        Wolf3D_Skin: THREE.MeshStandardMaterial;
        Wolf3D_Teeth: THREE.MeshStandardMaterial;
    };
};

export interface FacialExpression {
    [key: string]: number;
}

export interface FacialExpressions {
    [key: string]: FacialExpression;
}

export interface VisemeMapping {
    [key: string]: string;
}

export interface LipsyncData {
    mouthCues: Array<{
        start: number;
        end: number;
        value: string;
    }>;
}
