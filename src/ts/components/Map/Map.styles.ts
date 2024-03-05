export const mapStyles = {
    // Caro De Robertis
    pink: [
        {
            name: 'building-extrusion',
            type: 'fill-extrusion-color',
            color: '#dcbab2',
        },
        {
            name: 'tunnel-simple',
            type: 'line-color',
            color: '#6b9e82',
        },
        {
            name: 'road-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(147, 21%, 39%)',
                'hsl(147, 21%, 42%)',
            ],
        },
        {
            name: 'bridge-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(147, 21%, 39%)',
                'hsl(147, 21%, 42%)',
            ],
        },
        {
            name: 'road-label-simple',
            type: 'text-halo-color',
            color: '#558269',
        },
    ],

    // Denice Frohman
    brown: [
        {
            name: 'building-extrusion',
            type: 'fill-extrusion-color',
            color: '#b79257',
        },
        {
            name: 'tunnel-simple',
            type: 'line-color',
            color: '#de695e',
        },
        {
            name: 'road-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(5, 66%, 49%)',
                'hsl(5, 66%, 52%)',
            ],
        },
        {
            name: 'bridge-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(5, 66%, 49%)',
                'hsl(5, 66%, 52%)',
            ],
        },
        {
            name: 'road-label-simple',
            type: 'text-halo-color',
            color: '#d54134',
        },
    ],

    // Natalie Diaz
    orange: [
        {
            name: 'building-extrusion',
            type: 'fill-extrusion-color',
            color: '#c85c19',
        },
        {
            name: 'tunnel-simple',
            type: 'line-color',
            color: '#d0a49a',
        },
        {
            name: 'road-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(11, 37%, 75%)',
                'hsl(11, 37%, 78%)',
            ],
        },
        {
            name: 'bridge-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(11, 37%, 75%)',
                'hsl(11, 37%, 78%)',
            ],
        },
        {
            name: 'road-label-simple',
            type: 'text-halo-color',
            color: '#dcbab2',
        },
    ],

    // Eve Ewing
    paleBlue: [
        {
            name: 'building-extrusion',
            type: 'fill-extrusion-color',
            color: '#5d7c8e',
        },
        {
            name: 'tunnel-simple',
            type: 'line-color',
            color: '#e5742e',
        },
        {
            name: 'road-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(23, 78%, 41%)',
                'hsl(23, 78%, 44%)',
            ],
        },
        {
            name: 'bridge-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(23, 78%, 41%)',
                'hsl(23, 78%, 44%)',
            ],
        },
        {
            name: 'road-label-simple',
            type: 'text-halo-color',
            color: '#c85c19',
        },
    ],

    // Caleb Gayle
    purple: [
        {
            name: 'building-extrusion',
            type: 'fill-extrusion-color',
            color: '#d54134',
        },
        {
            name: 'tunnel-simple',
            type: 'line-color',
            color: '#eaaa2a',
        },
        {
            name: 'road-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(40, 82%, 58%)',
                'hsl(40, 82%, 61%)',
            ],
        },
        {
            name: 'bridge-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(40, 82%, 58%)',
                'hsl(40, 82%, 61%)',
            ],
        },
        {
            name: 'road-label-simple',
            type: 'text-halo-color',
            color: '#edb74a',
        },
    ],

    // Robin Coste Lewis
    green: [
        {
            name: 'building-extrusion',
            type: 'fill-extrusion-color',
            color: '#558269',
        },
        {
            name: 'tunnel-simple',
            type: 'line-color',
            color: '#de695e',
        },
        {
            name: 'road-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(5, 66%, 49%)',
                'hsl(5, 66%, 52%)',
            ],
        },
        {
            name: 'bridge-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(5, 66%, 49%)',
                'hsl(5, 66%, 52%)',
            ],
        },
        {
            name: 'road-label-simple',
            type: 'text-halo-color',
            color: '#d54134',
        },
    ],

    // April Reign
    default: [
        {
            name: 'building-extrusion',
            type: 'fill-extrusion-color',
            color: '#d54134',
        },
        {
            name: 'tunnel-simple',
            type: 'line-color',
            color: '#269bdf',
        },
        {
            name: 'road-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(5, 66%, 49%)',
                'hsl(5, 66%, 52%)',
            ],
        },
        {
            name: 'bridge-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(202, 74%, 38%)',
                'hsl(202, 74%, 41%)',
            ],
        },
        {
            name: 'road-label-simple',
            type: 'text-halo-color',
            color: '#1b7db6',
        },
    ],

    // Ellery Washington
    darkGreen: [
        {
            name: 'building-extrusion',
            type: 'fill-extrusion-color',
            color: '#016559',
        },
        {
            name: 'tunnel-simple',
            type: 'line-color',
            color: '#e5742e',
        },
        {
            name: 'road-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(23, 78%, 41%)',
                'hsl(23, 78%, 44%)',
            ],
        },
        {
            name: 'bridge-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(23, 78%, 41%)',
                'hsl(23, 78%, 44%)',
            ],
        },
        {
            name: 'road-label-simple',
            type: 'text-halo-color',
            color: '#c85c19',
        },
    ],

    // Renee Watson
    paleGreen: [
        {
            name: 'building-extrusion',
            type: 'fill-extrusion-color',
            color: '#9aa593',
        },
        {
            name: 'tunnel-simple',
            type: 'line-color',
            color: '#de695e',
        },
        {
            name: 'road-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(5, 66%, 49%)',
                'hsl(5, 66%, 52%)',
            ],
        },
        {
            name: 'bridge-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(5, 66%, 49%)',
                'hsl(5, 66%, 52%)',
            ],
        },
        {
            name: 'road-label-simple',
            type: 'text-halo-color',
            color: '#d54134',
        },
    ],

    // Jenna Wortham
    palePurple: [
        {
            name: 'building-extrusion',
            type: 'fill-extrusion-color',
            color: '#786887',
        },
        {
            name: 'tunnel-simple',
            type: 'line-color',
            color: '#de695e',
        },
        {
            name: 'road-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(5, 66%, 49%)',
                'hsl(5, 66%, 52%)',
            ],
        },
        {
            name: 'bridge-simple',
            type: 'line-color',
            color: [
                'match',
                ['get', 'class'],
                [
                    'primary_link',
                    'secondary_link',
                    'tertiary_link',
                    'street',
                    'street_limited',
                    'service',
                    'track',
                ],
                'hsl(5, 66%, 49%)',
                'hsl(5, 66%, 52%)',
            ],
        },
        {
            name: 'road-label-simple',
            type: 'text-halo-color',
            color: '#d54134',
        },
    ],
};
