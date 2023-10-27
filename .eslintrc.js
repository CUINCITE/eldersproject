module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true
    },
    extends: ['airbnb-base'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        ts: true
    },
    plugins: ['@typescript-eslint'],
    globals: {
        NodeListOf: 'readonly',
        Modernizr: 'readonly',
        Stats: 'readonly',
        JQuery: 'readonly',
        $: 'readonly',
        Window: 'readonly',
        CustomEase: 'readonly',
        gsap: 'readonly',
        GSAPStatic: 'readonly',
        JQueryXHR: 'readonly',
        SplitText: 'readonly',
        imagesLoaded: 'readonly',
        Swiper: 'readonly',
        ISwiperOptions: 'readonly',
        Youtube: 'readonly',
        YT: 'readonly'
    },
    rules: {
        'no-console': 'off',
        'linebreak-style': 'off',
        'no-useless-escape': 'off',
        'import/no-mutable-exports': 'off',
        'import/prefer-default-export': 'off',
        'class-methods-use-this': 'off',
        'comma-dangle': ['error', 'only-multiline'],
        'comma-spacing': ['error', { after: true, before: false }],
        'import/no-unresolved': 'off',
        'import/extensions': 'off',
        indent: [1, 4, { SwitchCase: 1 }],
        'quote-props': ['warn', 'consistent-as-needed'],
        'arrow-parens': ['error', 'as-needed'],
        'no-console:': 'off',
        'no-multiple-empty-lines': [2, { max: 3, maxEOF: 1, maxBOF: 0 }],
        'no-param-reassign': [2, { props: false }],
        'no-unused-expressions': ['warn', { allowShortCircuit: true, allowTernary: true }],
        'padding-line-between-statements': 'off',
        '@typescript-eslint/padding-line-between-statements': [
            'error',
            {
                blankLine: 'always',
                prev: '*',
                next: ['interface', 'type']
            },
        ],
        '@typescript-eslint/member-ordering': [
            'error',
            {
                default: [
                    // Index signature
                    'signature',
                    'call-signature',

                    // Static
                    'public-static-field',
                    'protected-static-field',
                    'private-static-field',
                    '#private-static-field',
                    'static-field',
                    'public-static-method',
                    'protected-static-method',
                    'private-static-method',
                    '#private-static-method',
                    'static-method',
                    'static-initialization',

                    // Fields
                    'public-decorated-field',
                    'protected-decorated-field',
                    'private-decorated-field',
                    'public-instance-field',
                    'protected-instance-field',
                    'private-instance-field',
                    '#private-instance-field',
                    'public-abstract-field',
                    'protected-abstract-field',
                    'public-field',
                    'protected-field',
                    'private-field',
                    '#private-field',
                    'instance-field',
                    'abstract-field',
                    'decorated-field',
                    'field',

                    // Constructors
                    'public-constructor',
                    'protected-constructor',
                    'private-constructor',
                    'constructor',

                    // Getters
                    'public-static-get',
                    'protected-static-get',
                    'private-static-get',
                    '#private-static-get',

                    'public-decorated-get',
                    'protected-decorated-get',
                    'private-decorated-get',

                    'public-instance-get',
                    'protected-instance-get',
                    'private-instance-get',
                    '#private-instance-get',

                    'public-abstract-get',
                    'protected-abstract-get',

                    'public-get',
                    'protected-get',
                    'private-get',
                    '#private-get',

                    'static-get',
                    'instance-get',
                    'abstract-get',

                    'decorated-get',

                    'get',

                    // Setters
                    'public-static-set',
                    'protected-static-set',
                    'private-static-set',
                    '#private-static-set',

                    'public-decorated-set',
                    'protected-decorated-set',
                    'private-decorated-set',

                    'public-instance-set',
                    'protected-instance-set',
                    'private-instance-set',
                    '#private-instance-set',

                    'public-abstract-set',
                    'protected-abstract-set',

                    'public-set',
                    'protected-set',
                    'private-set',
                    '#private-set',

                    'static-set',
                    'instance-set',
                    'abstract-set',

                    'decorated-set',

                    'set',

                    // Methods

                    'public-abstract-method',
                    'protected-abstract-method',

                    'public-decorated-method',
                    'protected-decorated-method',
                    'private-decorated-method',

                    'public-instance-method',
                    'protected-instance-method',
                    'private-instance-method',
                    '#private-instance-method',

                    'public-method',
                    'protected-method',
                    'private-method',
                    '#private-method',


                    'instance-method',
                    'abstract-method',

                    'decorated-method',

                    'method'
                ]
            },
        ],
        'lines-between-class-members': 'off',
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'max-len': ['warn', { code: 140 }],
        'no-unused-vars': 'warn',
        'no-new': 'warn',
        'no-undef': 'warn',
        'comma-dangle': 'always',
        'no-use-before-define': 'warn',
        'no-case-declarations': 'off',
        'no-nested-ternary': 'off',
        'max-classes-per-file': 'off',
        'padded-blocks': 'off',
        'object-curly-newline': ['warn', { multiline: true }],
        'object-curly-spacing': ['warn', 'always', { arraysInObjects: true, objectsInObjects: true }],
        'object-property-newline': 'off'
    }
};
