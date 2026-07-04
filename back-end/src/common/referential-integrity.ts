import { ConflictException } from '@nestjs/common';
import { EntityManager, EntityTarget, ObjectLiteral } from 'typeorm';

export interface DependanceCheck {
  entity: EntityTarget<ObjectLiteral>;
  where: ObjectLiteral;
  label: (n: number) => string;
}

/**
 * Garde-fou d'intégrité référentielle.
 * Compte les enregistrements qui référencent l'objet à supprimer ; s'il en
 * existe, lève un 409 (ConflictException) avec un message clair — au lieu de
 * laisser la BD renvoyer une violation de FK brute (500).
 *
 * @param cible ex. `le cycle "Primaire"` (article inclus)
 * @param suggestion phrase d'aide finale (par défaut : détacher).
 */
export async function verifierAvantSuppression(
  manager: EntityManager,
  cible: string,
  checks: DependanceCheck[],
  suggestion = "Détachez-les d'abord.",
): Promise<void> {
  const comptes = await Promise.all(
    checks.map((c) => manager.count(c.entity, { where: c.where })),
  );
  const liens = checks
    .map((c, i) => (comptes[i] > 0 ? c.label(comptes[i]) : null))
    .filter((x): x is string => Boolean(x));

  if (liens.length) {
    throw new ConflictException(
      `Impossible de supprimer ${cible} : ${liens.join(', ')} y sont rattaché(s). ${suggestion}`,
    );
  }
}
