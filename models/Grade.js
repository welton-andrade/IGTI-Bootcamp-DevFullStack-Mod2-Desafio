import { v4 as guid } from 'uuid';

export default class Grade {
    id = Number;
    student = String; //Nome estudante
    subject = String; //Nome materia
    type = String; //Nome atividade
    value = Number; //Nota da atividade
    timestamp = Date; //horario do lancamento

    constructor(student, subject, type, value) {
        this.id = guid();
        this.student = student;
        this.subject = subject
        this.type = type;
        this.value = value;
        this.timestamp = new Date();
    }
}