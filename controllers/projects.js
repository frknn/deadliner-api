const Project = require('../models/Project');
const Task = require('../models/Task');

exports.getAllProjects = async (req, res) => {
  const projects = await Project.findAll({
    include: [{
      model: Task,
      attributes: ['name', 'status', 'deadline', 'employeeId']
    }]
  });

  res.status(200).json({
    success: true,
    data: projects
  });
}

exports.createProject = async (req, res) => {
  const newProject = await Project.create(req.body);

  res.status(201).json({ success: true, data: newProject });
}

exports.getSingleProject = async (req, res) => {
  const project = await Project.findByPk(req.params.id)

  if (!project) {
    res.status(400).json({ success: false, message: "No Project with given ID" });
  }

  res.status(200).json({ success: true, data: project });
}

exports.removeProject = async (req, res) => {
  const project = await Project.findByPk(req.params.id);

  if (!project) {
    res.status(400).json({ success: false, message: "No Project with given ID" });
  }

  await project.destroy();

  res.status(200).json({ success: true, data: project });
}

exports.updateProject = async (req, res) => {
  const project = await Project.findByPk(req.params.id);

  if (!project) {
    res.status(400).json({ success: false, message: "No Project with given ID" });
  }

  let [rowsUpdated, updatedProject] = await Project.update(req.body, {
    returning: true, where: { id: req.params.id }
  });

  res.status(200).json({
    success: true,
    data: updatedProject,
    affectedRows: rowsUpdated
  });
}