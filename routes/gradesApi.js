import express from "express";
import Grade from "../models/Grade.js";
import {promises as fs} from "fs";

const {writeFile, readFile} = fs

const gradesApi = express.Router();
const {log} = console;

gradesApi.get("/", async (_, resp, next) => {
    let data = await getGrades();

    if(data.grades.length)
        resp.status(200).send(data.grades);
    else
        resp.status(400).send("Nenhum registro encontrado!");
});

gradesApi.get("/:id", async (req, resp, next) => {
    let data = await getGrades(true);
    if(data.grades.length){
        let gradeFilter = data.grades.filter(x => x.id === parseInt(req.params.id));
        //log(gradeFilter);
        resp.status(200).send(gradeFilter);
    } else {
        resp.status(400).send("Nenhum registro encontrado com esta chave!");
    }
});

gradesApi.post("/", async (req, resp, next) => {
    let g = req.body;
    if(hasRequiredParams(g)) {
        let grades = await getGrades();
        let newGrade = createGrade(grades, g);
        let responseAdd = await addGrades(grades, newGrade);
        //log(responseAdd);

        resp.status(200).send(responseAdd);
    } else {
        //throw new Exception("Parametros informados na requisição oncorretos!");
        resp.status(400).send("Parametros informados na requisição incorretos!");
    }
    //resp.end();
});

gradesApi.put("/", async (req, resp, next) => {
    let g = req.body;
    if(hasRequiredParams(g, true)) {
        let data = await getGrades();
        let responseUpdate = await updateGrade(data,g);

        if(responseUpdate != null)
            resp.status(200).send(responseUpdate);
        else
            resp.status(400).send("Chave do registro informado não encontrado!");
        
    }
});

gradesApi.delete("/:id", async (req, resp, next) => {
    let id = parseInt(req.params.id);
    let data = await getGrades();
    let deleteResponse = await deleteGrade(data, id);

    if(deleteResponse)
        resp.status(200).send("Excluido com sucesso!");
    else
        resp.status(400).send("Ocorreu um erro ao excluir");
});

gradesApi.post("/sumGrade", async (req, resp, next) =>{
    let student = req.body.student;
    let subject = req.body.subject;
    let data = await getGrades(true);
    let gradesFilter = data.grades.filter(x => x.student === student && x.subject === subject);
    if(gradesFilter.length) {
        let sumValues = gradesFilter.map(x => x.value).reduce((y,z) => y + z);
        resp.status(200).send({sumValues});
    }
});

gradesApi.post("/avgGrade", async (req, resp, next) => {
    let subject = req.body.subject;
    let type = req.body.type;
    let data = await getGrades(true);
    let gradesFilter = data.grades.filter(x => x.type === type && x.subject === subject);
    if(gradesFilter.length) {
        let avgValues = gradesFilter.map(x => x.value).reduce((y,z) => y + z)/gradesFilter.length;
        resp.status(200).send({avgValues});
    }
});

gradesApi.post("/top3", async (req, resp, next) => {
    let subject = req.body.subject;
    let type = req.body.type;
    let data = await getGrades(true);
    let gradesFilter = data.grades.filter(x => x.type === type && x.subject === subject);
    if(gradesFilter.length) {
        gradesFilter = gradesFilter.sort((x, y) => y.value - x.value).filter((x, i) => i < 3);
        resp.status(200).send(gradesFilter);
    }
});

/////////////////////////////////////////////////////////////////////////////

let deleteGrade = async (data, id) => {
    try {
        if(!data.grades.filter(x => x.id === id).length)
            return false;

        data.grades = data.grades.filter(x => x.id !== id);
        await writeFile(gradesFileName, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        return false;
    }
}

let hasRequiredParams = (x, reqId=false) => {
    if(reqId) {
        if(!x.id || !x.student || !x.type || x.value<0)
            return false;
    } else {
        if(!x.student || !x.type || x.value<0)
            return false;
    }
    return true;
}

let getGrades = async (removeNextId=false) => {
    let data = JSON.parse(await readFile(gradesFileName));
    if(removeNextId)
        delete data.nextId;
    return data;
}

let createGrade = (data, g) => {
    let newGrade = new Grade(g.student, g.subject, g.type, g.value);
    newGrade.id = data.nextId;
    return newGrade;
}

let addGrades = async (data, g) => {
    data.nextId++
    data.grades.push(g);
    await writeFile(gradesFileName, JSON.stringify(data, null, 2));
    return g;
}

let updateGrade = async (data, g) => {
    let index = data.grades.findIndex( x => x.id === g.id);

    if(index < 0)
        return null;

    data.grades[index] = g;
    await writeFile(gradesFileName, JSON.stringify(data, null, 2));
    return g;
}


export default gradesApi;