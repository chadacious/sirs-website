import Dexie from 'dexie';
// Note that we don't specify every column like we would in sql db. Here we only include things we want to use in where clauses
const db = new Dexie('sirsDB');
db.version(1).stores({
    diagram: `
        revision,
        filterTypeId,
        version,
        [filterTypeId+version+revision],
        [filterTypeId+version]
    `,
});

export default db;
