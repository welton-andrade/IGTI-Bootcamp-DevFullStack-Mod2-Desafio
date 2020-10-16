import express from "express";
import gradesApi from "./routes/gradesApi.js";
import {promises as fs} from "fs";

const app = express();
app.use(express.json());
app.use("/grade", gradesApi);

const {writeFile, readFile} = fs

global.gradesFileName = "grades.json";

app.listen(3000, async () => {
    const initialJson = {
        nextId: 1,
        grades: []
    }

    try {
        await readFile(gradesFileName);
        console.log(`Project [grades-control-api] Started!`);
    } catch (error) {
        await writeFile(gradesFileName, JSON.stringify(initialJson, null,2)).then(() => {
            console.log(`Project [grades-control-api] Started!`);
        }).catch(err => {
            console.error(err);
        });
    }
});



