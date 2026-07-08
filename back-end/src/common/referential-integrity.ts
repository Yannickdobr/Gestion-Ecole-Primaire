import { ConflictException } from '@nestjs/common';
import { EntityManager, EntityTarget, ObjectLiteral } from 'typeorm';

export interface DependanceCheck {
  entity: EntityTarget<ObjectLiteral>;
  where: ObjectLiteral;
  label: (n: number) => string;
  cascade?: (manager: EntityManager, where: ObjectLiteral) => Promise<void>;
}

/**
 * Garde-fou d'intégrité référentielle et cascade de suppression logique.
 * 
 * @param manager Le gestionnaire TypeORM
 * @param cible Nom de la cible (ex: `le cycle "Primaire"`)
 * @param checks Liste des dépendances à vérifier
 * @param force Si true, exécute la suppression en cascade (isDelete=1)
 * @param suggestion Suggestion en cas de blocage classique
 */
export async function verifierAvantSuppression(
  manager: EntityManager,
  cible: string,
  checks: DependanceCheck[],
  force: boolean = false,
  suggestion = "Détachez-les d'abord.",
): Promise<void> {
  if (force) {
    // Suppression en cascade (logique)
    for (const c of checks) {
      if (c.cascade) {
        await c.cascade(manager, c.where);
      } else {
        const items = await manager.find(c.entity, { where: { ...c.where, isDelete: 0 } });
        for (const item of items) {
          (item as any).isDelete = 1;
          await manager.save(c.entity, item);
        }
      }
    }
    return;
  }

  const comptes = await Promise.all(
    checks.map((c) => manager.count(c.entity, { where: { ...c.where, isDelete: 0 } })),
  );
  const liens = checks
    .map((c, i) => (comptes[i] > 0 ? c.label(comptes[i]) : null))
    .filter((x): x is string => Boolean(x));

  if (liens.length) {
    throw new ConflictException({
      message: `Impossible de supprimer ${cible} : ${liens.join(', ')} y sont rattaché(s). ${suggestion}`,
      impact: liens,
      requireConfirmation: true
    });
  }
}
