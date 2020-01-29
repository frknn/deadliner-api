// deletes given attributes from given employee
exports.deleteUnnecessaryFields = (emp, fields) => {
  fields.forEach(field => delete emp.get()[field])
}

// returns different unnecessary fields according to given role
// as an array to use in deleteUnnecessaryAttr function
exports.returnUnnecessaryFields = (role) => {
  if (role === 'Developer') return ['createdTasks', 'createdProjects', 'assignedProjects', 'password']
  if (role === 'Manager') return ['assignments', 'createdProjects', 'password']
  if (role === 'Creator') return ['assignments', 'createdTasks', 'assignedProjects', 'password']
  if (role === 'Admin') return ['assignments', 'createdTasks', 'createdProjects', 'assignedProjects', 'password']
}