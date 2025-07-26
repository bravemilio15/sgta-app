const express = require('express');
const router = express.Router();
const {
  registrarTarea,
  obtenerTareas,
  editarTarea,
  eliminarTarea
} = require('../controllers/taskController');

// Registrar una nueva tarea
router.post('/register', registrarTarea);

// Obtener todas las tareas
router.get('/', obtenerTareas);

// Editar una tarea existente
router.put('/:id', editarTarea);

// Eliminar una tarea
router.delete('/:id', eliminarTarea);

module.exports = router;