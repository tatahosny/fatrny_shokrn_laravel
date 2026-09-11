import fs from 'fs';
import path from 'path';

const roots = [
    path.resolve('resources/js/Pages/Admin'),
    path.resolve('resources/js/Pages/Restaurant'),
];

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [full];
    });
}

function unwrap(source, component) {
    const importRe = new RegExp(`import ${component} from ['"][^'"]+['"];\\r?\\n`);
    let next = source.replace(importRe, '');
    next = next.replace(new RegExp(`<${component}[\\s\\S]*?>\\s*`), '');
    next = next.replace(new RegExp(`\\s*</${component}>`), '');
    return next;
}

for (const root of roots) {
    for (const file of walk(root).filter((item) => item.endsWith('.tsx'))) {
        const original = fs.readFileSync(file, 'utf8');
        let updated = original;

        if (updated.includes('AdminLayout')) {
            updated = unwrap(updated, 'AdminLayout');
        }

        if (updated.includes('RestaurantLayout')) {
            updated = unwrap(updated, 'RestaurantLayout');
        }

        if (updated !== original) {
            fs.writeFileSync(file, updated);
            console.log('unwrapped', path.relative(process.cwd(), file));
        }
    }
}
