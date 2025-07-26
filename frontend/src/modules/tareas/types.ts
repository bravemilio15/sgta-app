export type Tarea = {
  id: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaEntrega: string;
  tipoTarea: 'ACD' | 'AA' | "APE";
  tareaTardia: boolean;
  diasEntregaTardia: number;
  porcentacePenalizacion:number;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  grupal: boolean;
};