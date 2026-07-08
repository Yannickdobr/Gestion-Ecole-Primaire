const fs = require("fs");
let content = fs.readFileSync("src/eleves/eleves.service.ts", "utf8");
// Remove the corrupted top part until `private eleveRepository:`
content = content.substring(content.indexOf("private eleveRepository:"));

const correctTop = `import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Eleve } from "../entities/eleve.entity";
import { Parents } from "../entities/parents.entity";
import { VilleNaissance } from "../entities/ville-naissance.entity";
import { Admin } from "../entities/admin.entity";
import { Personne } from "../entities/personne.entity";
import { Frequente } from "../entities/frequente.entity";
import { Paiement } from "../entities/paiement.entity";
import { Evaluation } from "../entities/evaluation.entity";
import { Rapport } from "../entities/rapport.entity";
import { CreateEleveDto, UpdateEleveDto, AddParentDto } from "./dto/eleve.dto";
import { verifierAvantSuppression } from "../common/referential-integrity";

@Injectable()
export class ElevesService {
  constructor(
    @InjectRepository(Eleve)
    `;

fs.writeFileSync("src/eleves/eleves.service.ts", correctTop + content);
console.log("Fixed!");

