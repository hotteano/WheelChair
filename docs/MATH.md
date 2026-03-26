# ∑ WheelChair 数学公式指南

WheelChair 编辑器内置 **KaTeX** 引擎，支持使用 LaTeX 语法输入数学公式。

---

## 快速开始

### 插入公式

| 方式 | 操作 |
|------|------|
| **快捷键** | `Ctrl+M` (行内) / `Ctrl+Shift+M` (块级) |
| **Markdown** | `$...$` (行内) / `$$...$$` (块级) |
| **工具栏** | 点击 Σ (行内) / ∫ (块级) |

### 基本示例

**行内公式**（在段落中）：
```
质能方程 $E = mc^2$ 由爱因斯坦提出。
```

**块级公式**（独立成行）：
```
$$
E = mc^2
$$
```

---

## 公式编辑器

### 打开方式

1. 按 `Ctrl+M` 或点击工具栏 Σ 按钮
2. 输入 LaTeX 代码
3. 实时预览显示在下方
4. 按 `Ctrl+Enter` 确认或 `Esc` 取消

### 编辑器界面

```
┌─────────────────────────────────┐
│ 编辑公式              [×]       │
├─────────────────────────────────┤
│  [编辑] [常用符号]              │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ E = mc^2                    │ │ ← 输入区
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │           E = mc²           │ │ ← 预览区
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│           [取消] [确认]         │
└─────────────────────────────────┘
```

### 常用符号标签

点击「常用符号」标签快速插入：
- 上标 `x^{2}` → $x^2$
- 下标 `x_{i}` → $x_i$
- 分数 `\frac{a}{b}` → $\frac{a}{b}$
- 根号 `\sqrt{x}` → $\sqrt{x}$
- 希腊字母 `\alpha` `\beta` `\pi`

---

## LaTeX 语法参考

### 基础语法

| 语法 | 示例 | 渲染结果 |
|------|------|---------|
| `^` 上标 | `x^2` | $x^2$ |
| `_` 下标 | `x_i` | $x_i$ |
| `\frac{}{}` 分数 | `\frac{a}{b}` | $\frac{a}{b}$ |
| `\sqrt{}` 平方根 | `\sqrt{x}` | $\sqrt{x}$ |
| `\sqrt[n]{}` n次根 | `\sqrt[3]{x}` | $\sqrt[3]{x}$ |

### 希腊字母

| 大写 | 小写 | 语法 |
|------|------|------|
| $A$ | $\alpha$ | `\alpha` |
| $B$ | $\beta$ | `\beta` |
| $\Gamma$ | $\gamma$ | `\Gamma` / `\gamma` |
| $\Delta$ | $\delta$ | `\Delta` / `\delta` |
| $E$ | $\epsilon$ / $\varepsilon$ | `\epsilon` / `\varepsilon` |
| $\Theta$ | $\theta$ | `\Theta` / `\theta` |
| $\Pi$ | $\pi$ | `\Pi` / `pi` |
| $\Sigma$ | $\sigma$ | `\Sigma` / `\sigma` |
| $\Phi$ | $\phi$ | `\Phi` / `\phi` |
| $\Omega$ | $\omega$ | `\Omega` / `\omega` |

### 运算符

| 运算符 | 语法 | 示例 |
|--------|------|------|
| $\times$ | `\times` | `a \times b` |
| $\div$ | `\div` | `a \div b` |
| $\pm$ | `\pm` | `x \pm y` |
| $\cdot$ | `\cdot` | `a \cdot b` |
| $\leq$ | `\leq` | `x \leq y` |
| $\geq$ | `\geq` | `x \geq y` |
| $\neq$ | `\neq` | `x \neq y` |
| $\approx$ | `\approx` | `\pi \approx 3.14` |
| $\infty$ | `\infty` | 无穷大 |
| $\partial$ | `\partial` | 偏导数 |
| $\nabla$ | `\nabla` | 梯度算子 |

### 求和与积分

| 符号 | 语法 | 示例 |
|------|------|------|
| $\sum$ | `\sum` | `\sum_{i=1}^{n} x_i` |
| $\prod$ | `\prod` | `\prod_{i=1}^{n} x_i` |
| $\int$ | `\int` | `\int_{a}^{b} f(x) dx` |
| $\iint$ | `\iint` | 二重积分 |
| $\oint$ | `\oint` | 环路积分 |

### 箭头

| 箭头 | 语法 |
|------|------|
| $\rightarrow$ | `\rightarrow` |
| $\leftarrow$ | `\leftarrow` |
| $\Rightarrow$ | `\Rightarrow` |
| $\Leftarrow$ | `\Leftarrow` |
| $\leftrightarrow$ | `\leftrightarrow` |
| $\uparrow$ | `\uparrow` |
| $\downarrow$ | `\downarrow` |

---

## 常用公式示例

### 代数

```latex
% 二次方程求根公式
$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

% 二项式定理
$$(a + b)^n = \sum_{k=0}^{n} C_n^k a^{n-k} b^k$$
```

### 几何

```latex
% 勾股定理
$$a^2 + b^2 = c^2$$

% 圆面积
$$S = \pi r^2$$

% 球体积
$$V = \frac{4}{3}\pi r^3$$
```

### 微积分

```latex
% 导数定义
$$f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$$

% 牛顿-莱布尼茨公式
$$\int_{a}^{b} f(x) dx = F(b) - F(a)$$

% 泰勒展开
$$f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n$$
```

### 线性代数

```latex
% 矩阵
$$
A = \begin{bmatrix}
a_{11} & a_{12} & a_{13} \\
a_{21} & a_{22} & a_{23} \\
a_{31} & a_{32} & a_{33}
\end{bmatrix}
$$

% 行列式
$$
\det(A) = \begin{vmatrix}
a & b \\
c & d
\end{vmatrix} = ad - bc
$$
```

### 概率统计

```latex
% 期望值
$$E(X) = \sum_{i} x_i p(x_i)$$

% 正态分布
$$f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$
```

### 物理

```latex
% 爱因斯坦质能方程
$$E = mc^2$$

% 麦克斯韦方程组
$$
\nabla \cdot \mathbf{E} = \frac{\rho}{\varepsilon_0}
$$
```

---

## 高级技巧

### 多行公式

使用 `align` 环境对齐多行公式：

```latex
$$
\begin{align}
a &= b + c \\
d &= e + f \\
g &= h + i
\end{align}
$$
```

### 公式编号

块级公式自动居中显示，无需手动编号。

### 字体大小

在行内公式中，KaTeX 会自动调整字体大小以适应行高。

---

## 故障排除

### 公式渲染失败

1. **检查语法**：确保 LaTeX 语法正确
2. **转义字符**：特殊字符需要转义，如 `\{` `\}`
3. **查看错误**：公式编辑器会显示错误信息

### 常见错误

| 错误 | 原因 | 解决 |
|------|------|------|
| `Undefined control sequence` | 未知命令 | 检查拼写 |
| `Missing { inserted` | 缺少左花括号 | 补全括号 |
| `Extra }, or forgotten {` | 括号不匹配 | 检查括号 |

---

## 学习资源

- [KaTeX 官方文档](https://katex.org/docs/supported.html)
- [LaTeX 数学符号表](https://en.wikibooks.org/wiki/LaTeX/Mathematics)
- [常用数学公式 LaTeX 代码](https://www.caam.rice.edu/~heinken/latex/symbols.pdf)
