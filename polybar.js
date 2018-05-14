const exec = require('child_process').exec;
var Queue = require('better-queue');

const queue = new Queue(({ pid, cmd }, cb) => {
  const command = `echo ${cmd} >/tmp/${pid}`
  console.log(command)
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return console.error(`exec error: ${error}`);
    }
    cb(null);
  })
}, { concurrent: 1})

exports.hook = (module, index, pid) => {
  queue.push({
    pid,
    cmd: `hook:module/${module + index}`
  })
}

exports.show = (pid) => {
  queue.push({ pid, cmd: "cmd:show" })
}
exports.hide = (pid) => {
  queue.push({ pid, cmd: "cmd:hide" })
}
