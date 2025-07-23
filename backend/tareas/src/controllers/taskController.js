const {
  guardarTareaEnFirestore,
  obtenerTareasDeFirestore,
  editarTareaEnFirestore,
  eliminarTareaEnFirestore
} = require('../services/firebaseService');

// Registrar una nueva tarea
async function registrarTarea(req, res) {
  try {
    const {
      titulo,
      descripcion,
      fechaInicio,
      fechaEntrega,
      tipoTarea,
      tareaTardia,
      diasEntregaTardia,
      porcentajePenalizacion,
      estado,
      grupal
    } = req.body;

    const tarea = {
      titulo,
      descripcion,
      fechaInicio,
      fechaEntrega,
      tipoTarea,
      tareaTardia,
      diasEntregaTardia,
      porcentajePenalizacion,
      estado,
      grupal
    };

    const id = await guardarTareaEnFirestore(tarea);

    res.status(201).json({
      message: 'Tarea registrada correctamente',
      id,
      tarea
    });
  } catch (error) {
    console.error('Error al registrar tarea:', error);
    res.status(500).json({ error: error.message });
  }
}

// Obtener todas las tareas
async function obtenerTareas(req, res) {
  try {
    const tareas = await obtenerTareasDeFirestore();
    res.json(tareas);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ error: error.message });
  }
}

// Editar una tarea existente

async function editarTarea(req, res) {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    await editarTareaEnFirestore(id, datosActualizados);
    res.json({ message: 'Tarea actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Eliminar una tarea

async function eliminarTarea(req, res) {
  try {
    const { id } = req.params;
    await eliminarTareaEnFirestore(id);
    res.json({ message: 'Tarea eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { registrarTarea, obtenerTareas, editarTarea, eliminarTarea };