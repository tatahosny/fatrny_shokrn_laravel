export interface UniversityLocation {
    id: string;
    name: string;
    shortName: string;
    description: string;
    badge: string;
    latitude: number;
    longitude: number;
    locations: string[];
}

export const BORG_EL_ARAB_UNIVERSITIES: UniversityLocation[] = [
    {
        id: 'BATU',
        name: 'جامعة برج العرب التكنولوجية (BATU)',
        shortName: 'برج العرب التكنولوجية',
        description: 'الحرم الجامعي الرئيسي - برج العرب الجديدة',
        badge: 'تكنولوجية',
        latitude: 30.8756,
        longitude: 29.5842,
        locations: [
            'البوابة الرئيسية (الاستقبال والأمن)',
            'المبنى الإداري ورعاية الشباب',
            'كلية تكنولوجيا الصناعة والطاقة',
            'كلية تكنولوجيا العلوم الصحية',
            'مبنى الورش والمعامل الهندسية',
            'سكن الطلاب الجامعي (مبنى بنين)',
            'سكن الطالبات الجامعي (مبنى بنات)',
            'كافيتريا وساحة الأنشطة الطلابية المركزية',
        ],
    },
    {
        id: 'EJUST',
        name: 'الجامعة المصرية اليابانية للعلوم والتكنولوجيا (E-JUST)',
        shortName: 'الجامعة المصرية اليابانية',
        description: 'الحرم الرئيسي - الحي السكني الثالث - برج العرب',
        badge: 'يابانية',
        latitude: 30.8648,
        longitude: 29.5741,
        locations: [
            'البوابة الرئيسية (Gate 1 - الاستقبال)',
            'بوابة 2 (Gate 2)',
            'مبنى الأنشطة الطلابية (SAC Building)',
            'مبنى كلية الهندسة والتكنولوجيا (Building 1)',
            'كلية إدارة الأعمال الدولية (FIB Building)',
            'المكتبة المركزية والساحة اليابانية',
            'سكن الطلاب والباحثين داخل الحرم الجامعي',
            'كافتيريا ومطاعم الحرم الجامعي',
        ],
    },
    {
        id: 'SENGHOR',
        name: 'جامعة سنجور الدولية (Senghor University)',
        shortName: 'جامعة سنجور',
        description: 'المقر الجديد - برج العرب الجديدة',
        badge: 'دولية فرنسية',
        latitude: 30.8805,
        longitude: 29.5912,
        locations: [
            'البوابة الرئيسية للجامعة',
            'المبنى التعليمي الرئيسي والإدارة المركزية',
            'مركز المؤتمرات والندوات الدولية',
            'مبنى سكن الطلاب والوفود الدولية',
            'ساحة الفعاليات والأنشطة الطلابية',
        ],
    },
];

/**
 * Calculate geographical distance in kilometers between two GPS coordinates using the Haversine formula.
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.max(0.5, Math.round(distance * 10) / 10);
}

export const OTHER_UNIVERSITIES_OPTIONS = [
    'جامعة الإسكندرية',
    'جامعة مطروح',
    'الأكاديمية العربية للعلوم والتكنولوجيا والنقل البحري (AASTMT)',
    'جامعة فاروس (PUA)',
    'جامعة العلمين الدولية (AIU)',
    'معهد العالي للهندسة والتكنولوجيا ببرج العرب',
    'أخرى (جامعة / معهد آخر في مصر)',
];
