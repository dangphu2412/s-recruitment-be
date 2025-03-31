import ZKLib from 'node-zklib';
import { Storage } from '@google-cloud/storage';
import * as process from 'node:process';
import { config } from 'dotenv';

// https://github.com/caobo171/node-zklib
async function main() {
  config();

  const storage = new Storage({
    projectId: 'sgroup-hr-management-prod',
    keyFilename: `${process.cwd()}/service_account.json`,
  });

  const bucket = storage.bucket('sgroup-bucket');
  const zkService = new ZKLib(process.env.ZK_IP, 4370, 10000, 4000);

  try {
    await zkService.createSocket();

    // Get general info like logCapacity, user counts, logs count
    // It's really useful to check the status of device
    console.log(await zkService.getInfo());
  } catch (e) {
    console.log(e);
    await zkService.disconnect();
    process.exit(1);
  }

  const { data } = await zkService.getAttendances();
  await bucket.file('attendances.json').save(JSON.stringify(data));

  const users = await zkService.getUsers();
  await bucket.file('users.json').save(JSON.stringify(users));

  await zkService.disconnect();
  process.exit(0);
}

main();
