const ZKLib = require('node-zklib')
const fs = require('fs/promises');

// https://github.com/caobo171/node-zklib
const main = async () => {
  let zkInstance = new ZKLib('192.168.1.202', 4370, 10000, 4000);
  try {
    // Create socket to machine
    await zkInstance.createSocket()

    // Get general info like logCapacity, user counts, logs count
    // It's really useful to check the status of device
    console.log(await zkInstance.getInfo())
  } catch (e) {
    console.log(e)
    if (e.code === 'EADDRINUSE') {
    }
  }

  const { data } = await zkInstance.getAttendances();
  const to = './data/attendances.json';
  await fs.writeFile(to, JSON.stringify(data))

  const users = await zkInstance.getUsers()

  const toUsers = './data/users.json';
  await fs.writeFile(toUsers, JSON.stringify(users))
  await zkInstance.disconnect()
}

main()


