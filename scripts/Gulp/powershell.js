import powershell from "powershell";
import * as log from "./log";

export const run = (command, done) => {
    let ps = new powershell("& " + command);
    ps.on("output", data => { log.info(data); });
    ps.on("error", err => { log.error(err); });
    ps.on("error-output", data => { log.error(data); });
    ps.on("end", code => done());
};