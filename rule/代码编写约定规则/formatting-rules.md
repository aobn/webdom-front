# 代码格式化和 ESLint 配置规范

## 概述

本文档定义了项目的代码格式化规范和 ESLint 配置，确保代码风格的一致性和质量标准。

## ESLint 配置

### 基础配置文件
```javascript
// eslint.config.js
/**
 * @fileoverview ESLint 配置文件
 * @author 开发者姓名
 * @created 2024-01-20
 */

import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import * as parserVue from 'vue-eslint-parser'
import configTypeScript from '@vue/eslint-config-typescript'
import configPrettier from '@vue/eslint-config-prettier'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}']
  },
  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/.vscode/**',
      '**/.idea/**'
    ]
  },
  
  // JavaScript 基础规则
  js.configs.recommended,
  
  // Vue 相关规则
  ...pluginVue.configs['flat/recommended'],
  
  // TypeScript 规则
  ...configTypeScript(),
  
  // Prettier 集成
  configPrettier,
  
  // 自定义规则
  {
    name: 'app/vue-rules',
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
        ecmaVersion: 'latest'
      }
    },
    rules: {
      // Vue 组件规则
      'vue/multi-word-component-names': 'error',
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/define-emits-declaration': 'error',
      'vue/define-props-declaration': 'error',
      'vue/no-unused-vars': 'error',
      'vue/no-unused-components': 'error',
      'vue/no-unused-refs': 'error',
      'vue/require-default-prop': 'error',
      'vue/require-prop-types': 'error',
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/attribute-hyphenation': ['error', 'always'],
      'vue/v-on-event-hyphenation': ['error', 'always'],
      
      // 模板规则
      'vue/html-indent': ['error', 2],
      'vue/html-quotes': ['error', 'double'],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'never',
            normal: 'always',
            component: 'always'
          },
          svg: 'always',
          math: 'always'
        }
      ],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: { max: 3 },
          multiline: { max: 1 }
        }
      ],
      'vue/first-attribute-linebreak': [
        'error',
        {
          singleline: 'ignore',
          multiline: 'below'
        }
      ],
      
      // 脚本规则
      'vue/script-indent': ['error', 2, { baseIndent: 0 }],
      'vue/block-order': [
        'error',
        {
          order: ['template', 'script', 'style']
        }
      ],
      
      // 样式规则
      'vue/component-tags-order': [
        'error',
        {
          order: ['template', 'script', 'style']
        }
      ]
    }
  },
  
  {
    name: 'app/typescript-rules',
    files: ['**/*.{ts,mts,tsx,vue}']
    rules: {
      // TypeScript 特定规则
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-const': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false
        }
      ],
      
      // 命名约定
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase']
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase']
        },
        {
          selector: 'enum',
          format: ['PascalCase']
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE']
        },
        {
          selector: 'class',
          format: ['PascalCase']
        },
        {
          selector: 'function',
          format: ['camelCase']
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE']
        }
      ]
    }
  },
  
  {
    name: 'app/general-rules',
    rules: {
      // 通用规则
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'error',
      'comma-dangle': ['error', 'never'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'never'],
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'computed-property-spacing': ['error', 'never'],
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always'
        }
      ]
    }
  }
]
```

### 自动导入配置
```json
// .eslintrc-auto-import.json
{
  "globals": {
    "computed": "readonly",
    "createApp": "readonly",
    "customRef": "readonly",
    "defineAsyncComponent": "readonly",
    "defineComponent": "readonly",
    "defineEmits": "readonly",
    "defineExpose": "readonly",
    "defineProps": "readonly",
    "getCurrentInstance": "readonly",
    "getCurrentScope": "readonly",
    "inject": "readonly",
    "isProxy": "readonly",
    "isReactive": "readonly",
    "isReadonly": "readonly",
    "isRef": "readonly",
    "markRaw": "readonly",
    "nextTick": "readonly",
    "onActivated": "readonly",
    "onBeforeMount": "readonly",
    "onBeforeUnmount": "readonly",
    "onBeforeUpdate": "readonly",
    "onDeactivated": "readonly",
    "onErrorCaptured": "readonly",
    "onMounted": "readonly",
    "onScopeDispose": "readonly",
    "onServerPrefetch": "readonly",
    "onUnmounted": "readonly",
    "onUpdated": "readonly",
    "provide": "readonly",
    "reactive": "readonly",
    "readonly": "readonly",
    "ref": "readonly",
    "resolveComponent": "readonly",
    "shallowReactive": "readonly",
    "shallowReadonly": "readonly",
    "shallowRef": "readonly",
    "toRaw": "readonly",
    "toRef": "readonly",
    "toRefs": "readonly",
    "triggerRef": "readonly",
    "unref": "readonly",
    "useAttrs": "readonly",
    "useCssModule": "readonly",
    "useCssVars": "readonly",
    "useSlots": "readonly",
    "watch": "readonly",
    "watchEffect": "readonly",
    "watchPostEffect": "readonly",
    "watchSyncEffect": "readonly"
  }
}
```

## Prettier 配置

### 配置文件
```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "trailingComma": "none",
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 80,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "embeddedLanguageFormatting": "auto",
  "htmlWhitespaceSensitivity": "css",
  "insertPragma": false,
  "jsxSingleQuote": true,
  "proseWrap": "preserve",
  "requirePragma": false,
  "vueIndentScriptAndStyle": false,
  "overrides": [
    {
      "files": "*.vue",
      "options": {
        "parser": "vue"
      }
    },
    {
      "files": "*.json",
      "options": {
        "parser": "json"
      }
    },
    {
      "files": "*.md",
      "options": {
        "parser": "markdown",
        "proseWrap": "always"
      }
    }
  ]
}
```

### 忽略文件
```
# .prettierignore
# 构建输出
dist/
dist-ssr/
coverage/

# 依赖
node_modules/

# 日志
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# 系统文件
.DS_Store
*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# 环境文件
.env
.env.local
.env.*.local

# 其他
*.tgz
*.tar.gz
```

## EditorConfig 配置

```ini
# .editorconfig
# EditorConfig 配置文件
# 确保不同编辑器的一致性

root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[*.json]
indent_size = 2

[*.{js,ts,vue}]
indent_size = 2

[*.{css,scss,less}]
indent_size = 2

[*.html]
indent_size = 2

[Makefile]
indent_style = tab
```

## Git Hooks 配置

### Husky 配置
```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix",
    "lint:check": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "vue-tsc --noEmit"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,less,html,json,md}": [
      "prettier --write"
    ]
  }
}
```

### Pre-commit Hook
```bash
#!/usr/bin/env sh
# .husky/pre-commit

. "$(dirname -- "$0")/_/husky.sh"

# 运行 lint-staged
npx lint-staged

# 类型检查
npm run type-check
```

### Commit Message Hook
```bash
#!/usr/bin/env sh
# .husky/commit-msg

. "$(dirname -- "$0")/_/husky.sh"

# 验证提交消息格式
npx commitlint --edit "$1"
```

## Commitlint 配置

### 配置文件
```javascript
// commitlint.config.js
/**
 * @fileoverview Commitlint 配置文件
 * @author 开发者姓名
 * @created 2024-01-20
 */

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型枚举
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复
        'docs',     // 文档
        'style',    // 格式（不影响代码运行的变动）
        'refactor', // 重构
        'perf',     // 性能优化
        'test',     // 增加测试
        'chore',    // 构建过程或辅助工具的变动
        'revert',   // 回滚
        'build',    // 构建系统或外部依赖项的更改
        'ci'        // CI 配置文件和脚本的更改
      ]
    ],
    // 主题长度
    'subject-max-length': [2, 'always', 72],
    'subject-min-length': [2, 'always', 10],
    // 主题格式
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    // 类型格式
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    // 范围格式
    'scope-case': [2, 'always', 'lower-case']
  }
}
```

## VS Code 配置

### 工作区设置
```json
// .vscode/settings.json
{
  // 编辑器设置
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  
  // 文件设置
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "files.trimFinalNewlines": true,
  
  // ESLint 设置
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "eslint.format.enable": true,
  
  // Prettier 设置
  "prettier.enable": true,
  "prettier.requireConfig": true,
  
  // Vue 设置
  "vetur.validation.template": false,
  "vetur.validation.script": false,
  "vetur.validation.style": false,
  
  // Volar 设置
  "vue.codeActions.enabled": true,
  "vue.complete.casing.tags": "pascal",
  "vue.complete.casing.props": "camel",
  
  // TypeScript 设置
  "typescript.preferences.quoteStyle": "single",
  "typescript.format.semicolons": "remove",
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  
  // 文件关联
  "files.associations": {
    "*.vue": "vue"
  },
  
  // 排除文件
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true,
    "**/.nuxt": true,
    "**/.output": true
  },
  
  // 搜索排除
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true,
    "**/.nuxt": true,
    "**/.output": true
  }
}
```

### 推荐扩展
```json
// .vscode/extensions.json
{
  "recommendations": [
    "Vue.volar",
    "Vue.vscode-typescript-vue-plugin",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "EditorConfig.EditorConfig",
    "streetsidesoftware.code-spell-checker",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-css-peek"
  ]
}
```

## 代码质量检查脚本

### Package.json 脚本
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix",
    "lint:check": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts",
    "lint:fix": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix",
    
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    
    "type-check": "vue-tsc --noEmit",
    "type-check:watch": "vue-tsc --noEmit --watch",
    
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    
    "quality:check": "npm run lint:check && npm run format:check && npm run type-check",
    "quality:fix": "npm run lint:fix && npm run format",
    
    "prepare": "husky install"
  }
}
```

### 质量检查脚本
```bash
#!/bin/bash
# scripts/quality-check.sh

# 代码质量检查脚本

echo "🔍 开始代码质量检查..."

# 1. ESLint 检查
echo "📋 运行 ESLint 检查..."
if ! npm run lint:check; then
  echo "❌ ESLint 检查失败"
  exit 1
fi
echo "✅ ESLint 检查通过"

# 2. Prettier 格式检查
echo "🎨 运行 Prettier 格式检查..."
if ! npm run format:check; then
  echo "❌ Prettier 格式检查失败"
  exit 1
fi
echo "✅ Prettier 格式检查通过"

# 3. TypeScript 类型检查
echo "🔧 运行 TypeScript 类型检查..."
if ! npm run type-check; then
  echo "❌ TypeScript 类型检查失败"
  exit 1
fi
echo "✅ TypeScript 类型检查通过"

# 4. 运行测试
echo "🧪 运行测试..."
if ! npm run test; then
  echo "❌ 测试失败"
  exit 1
fi
echo "✅ 测试通过"

echo "🎉 所有代码质量检查通过！"
```

## CI/CD 集成

### GitHub Actions 工作流
```yaml
# .github/workflows/quality-check.yml
name: Code Quality Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run ESLint
      run: npm run lint:check
    
    - name: Run Prettier check
      run: npm run format:check
    
    - name: Run TypeScript check
      run: npm run type-check
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
```

## 最佳实践

### 1. 代码格式化
- 使用 Prettier 进行自动格式化
- 配置编辑器保存时自动格式化
- 统一团队的格式化规则

### 2. 代码检查
- 使用 ESLint 进行代码质量检查
- 配置适合项目的规则集
- 定期更新规则配置

### 3. Git 工作流
- 使用 Git Hooks 确保代码质量
- 提交前自动运行检查
- 规范提交消息格式

### 4. 编辑器配置
- 使用 EditorConfig 统一编辑器设置
- 配置 VS Code 工作区设置
- 安装推荐的扩展插件

### 5. 持续集成
- 在 CI/CD 中集成代码质量检查
- 自动运行测试和覆盖率检查
- 阻止不符合质量标准的代码合并

## 故障排除

### 常见问题

#### ESLint 配置冲突
```bash
# 清除 ESLint 缓存
npx eslint --cache-location .eslintcache --cache

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

#### Prettier 格式化问题
```bash
# 检查 Prettier 配置
npx prettier --check .

# 强制格式化所有文件
npx prettier --write . --ignore-unknown
```

#### TypeScript 类型错误
```bash
# 重新生成类型定义
npm run type-check

# 清除 TypeScript 缓存
rm -rf node_modules/.cache
```

## 相关链接

- [返回主规范文档](./代码编写约定规则.md)
- [Vue 组件编写规范](./vue-component-rules.md)
- [TypeScript 编码规范](./typescript-rules.md)
- [ESLint 官方文档](https://eslint.org/)
- [Prettier 官方文档](https://prettier.io/)
- [Husky 官方文档](https://typicode.github.io/husky/)