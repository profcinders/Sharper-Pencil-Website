import fs from "fs";

const file = {
    exists: path => fs.existsSync(path),
    absPath: path => fs.realpathSync(path)
};

export default file;