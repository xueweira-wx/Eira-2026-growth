// ========================================
// SQL Tutorial Content
// ========================================

const SQL_TUTORIAL = {
  id: 'sql',
  name: 'SQL 数据库入门',
  icon: '\uD83D\uDCBE',
  color: '#667eea',
  chapters: [
    // ========================================
    // Chapter 1: 认识数据库
    // ========================================
    {
      id: '1',
      title: '第1章：认识数据库',
      lessons: [
        {
          id: '1-1',
          title: '什么是数据库？',
          content: `
            <h2>什么是数据库？</h2>
            <p>想象一下，你有一个超级强大的<strong>Excel表格</strong>。这个表格不仅可以存储成千上万条数据，还可以在一秒钟内帮你找到你想要的任何信息。这就是<strong>数据库</strong>的基本概念。</p>

            <h3>生活中的数据库</h3>
            <p>其实数据库无处不在，你每天都在跟它打交道：</p>
            <ul>
              <li><strong>微信通讯录</strong> —— 存储了你所有好友的名字、头像、手机号</li>
              <li><strong>淘宝</strong> —— 存储了所有商品的名称、价格、库存、评价</li>
              <li><strong>学校教务系统</strong> —— 存储了所有学生的成绩、课程、教师信息</li>
              <li><strong>银行系统</strong> —— 存储了你的账户余额、每笔转账记录</li>
            </ul>

            <h3>数据库 vs Excel</h3>
            <p>你可能会问：那跟Excel有什么区别呢？最大的区别有三点：</p>
            <ul>
              <li><strong>容量</strong>：Excel处理几万行就会卡顿，数据库可以轻松处理上亿条数据</li>
              <li><strong>速度</strong>：数据库可以在毫秒内查找到你需要的数据</li>
              <li><strong>多人协作</strong>：多个人可以同时读写同一个数据库，不会冲突</li>
            </ul>

            <h3>数据库的基本结构</h3>
            <p>数据库里的数据是以<strong>表（Table）</strong>的形式存储的，就像Excel里的一个个工作表：</p>
            <div class="tutorial-example">
              <p><strong>示例：students 表</strong></p>
              <table class="tutorial-table">
                <thead><tr><th>id</th><th>name</th><th>age</th><th>grade</th></tr></thead>
                <tbody>
                  <tr><td>1</td><td>小明</td><td>18</td><td>高三</td></tr>
                  <tr><td>2</td><td>小红</td><td>17</td><td>高二</td></tr>
                  <tr><td>3</td><td>小华</td><td>18</td><td>高三</td></tr>
                </tbody>
              </table>
            </div>
            <p>每一<strong>行</strong>是一条记录（一个学生的信息），每一<strong>列</strong>是一个字段（比如姓名、年龄）。</p>

            <h3>常见的数据库类型</h3>
            <p>目前最常用的数据库有：</p>
            <ul>
              <li><strong>MySQL</strong> —— 最流行的开源数据库，大部分网站都在用</li>
              <li><strong>PostgreSQL</strong> —— 功能最强大的开源数据库</li>
              <li><strong>SQLite</strong> —— 最轻量的数据库，手机App经常使用</li>
              <li><strong>SQL Server</strong> —— 微软出品，企业常用</li>
            </ul>
            <p>在我们的学习中，我们会使用 <strong>SQLite</strong>，因为它最简单，而且可以直接在浏览器里运行！</p>
          `,
          exercise: null
        },
        {
          id: '1-2',
          title: '什么是SQL？',
          content: `
            <h2>什么是SQL？</h2>
            <p><strong>SQL</strong>（读作"S-Q-L"或"sequel"）是 <em>Structured Query Language</em> 的缩写，翻译过来就是<strong>结构化查询语言</strong>。</p>

            <p>简单来说，SQL就是<strong>你和数据库对话的语言</strong>。你想从数据库里获取什么数据、添加什么数据、修改什么数据，都需要用SQL来告诉数据库。</p>

            <h3>一个有趣的比喻</h3>
            <p>把数据库想象成一个<strong>超大的图书馆</strong>，SQL就是你跟<strong>图书管理员</strong>交流的方式：</p>
            <ul>
              <li>"帮我找所有关于Python的书" —— 这就是<strong>查询（SELECT）</strong></li>
              <li>"帮我把这本新书放到架子上" —— 这就是<strong>插入（INSERT）</strong></li>
              <li>"帮我把这本书的价格改成50块" —— 这就是<strong>更新（UPDATE）</strong></li>
              <li>"帮我把这本过期的书扔掉" —— 这就是<strong>删除（DELETE）</strong></li>
            </ul>

            <h3>SQL的四大基本操作</h3>
            <p>SQL的核心操作可以用 <strong>CRUD</strong> 来概括：</p>
            <ul>
              <li><strong>C</strong>reate（创建）—— <code>INSERT</code> 添加新数据</li>
              <li><strong>R</strong>ead（读取）—— <code>SELECT</code> 查询数据</li>
              <li><strong>U</strong>pdate（更新）—— <code>UPDATE</code> 修改数据</li>
              <li><strong>D</strong>elete（删除）—— <code>DELETE</code> 删除数据</li>
            </ul>

            <h3>SQL长什么样？</h3>
            <p>先来看一个最简单的SQL语句：</p>
            <div class="tutorial-code">SELECT * FROM students;</div>
            <p>翻译成中文就是：<strong>从 students 表中，查询所有数据</strong>。</p>
            <p>是不是很像在跟图书管理员说话？SQL就是这么直观！</p>

            <h3>SQL的书写规则</h3>
            <ul>
              <li>SQL关键字（如 SELECT、FROM）<strong>不区分大小写</strong>，但习惯上我们会把关键字写成大写</li>
              <li>每条SQL语句以<strong>分号（;）</strong>结尾</li>
              <li>表名和列名通常用<strong>小写字母</strong></li>
              <li>可以分多行书写，SQL不关心换行</li>
            </ul>

            <div class="tutorial-tip">
              <strong>小贴士：</strong>在接下来的课程中，我们会从最简单的 SELECT 查询开始，一步步学习所有这些操作。不用担心，每一节课都有练习让你亲自动手试试！
            </div>
          `,
          exercise: null
        }
      ]
    },

    // ========================================
    // Chapter 2: SELECT 查询基础
    // ========================================
    {
      id: '2',
      title: '第2章：SELECT 查询基础',
      lessons: [
        {
          id: '2-1',
          title: '查询所有数据',
          content: `
            <h2>SELECT * —— 查询所有数据</h2>
            <p><code>SELECT</code> 是SQL中最常用的关键字，用来从数据库表中<strong>查询</strong>数据。</p>

            <h3>基本语法</h3>
            <div class="tutorial-code">SELECT * FROM 表名;</div>
            <p>这里的 <code>*</code> 是一个通配符，代表<strong>"所有列"</strong>。整句话的意思是：从某张表中，查询所有列的所有数据。</p>

            <h3>实际例子</h3>
            <p>假设我们有一张 <code>students</code> 表，包含以下数据：</p>
            <div class="tutorial-example">
              <table class="tutorial-table">
                <thead><tr><th>id</th><th>name</th><th>age</th><th>grade</th></tr></thead>
                <tbody>
                  <tr><td>1</td><td>小明</td><td>18</td><td>高三</td></tr>
                  <tr><td>2</td><td>小红</td><td>17</td><td>高二</td></tr>
                  <tr><td>3</td><td>小华</td><td>18</td><td>高三</td></tr>
                  <tr><td>4</td><td>小丽</td><td>16</td><td>高一</td></tr>
                </tbody>
              </table>
            </div>
            <p>执行以下SQL：</p>
            <div class="tutorial-code">SELECT * FROM students;</div>
            <p>结果会返回表中的<strong>所有行、所有列</strong>的数据，也就是上面的整张表。</p>

            <h3>注意事项</h3>
            <ul>
              <li><code>SELECT</code> 和 <code>FROM</code> 是SQL的关键字，必须一起使用</li>
              <li><code>*</code> 代表查询所有列</li>
              <li>语句最后要加<strong>分号 <code>;</code></strong></li>
              <li>表名要写正确，SQL会告诉你"没有这张表"如果写错了</li>
            </ul>

            <div class="tutorial-tip">
              <strong>试一试：</strong>在下面的练习区域，输入SQL语句来查询 students 表中的所有数据吧！
            </div>
          `,
          exercise: {
            description: '请查询 students 表中的所有数据',
            setupSQL: 'CREATE TABLE students (id INTEGER, name TEXT, age INTEGER, grade TEXT); INSERT INTO students VALUES (1, "小明", 18, "高三"); INSERT INTO students VALUES (2, "小红", 17, "高二"); INSERT INTO students VALUES (3, "小华", 18, "高三"); INSERT INTO students VALUES (4, "小丽", 16, "高一");',
            answer: 'SELECT * FROM students;',
            hint: '使用 SELECT * FROM 表名 来查询所有数据'
          }
        },
        {
          id: '2-2',
          title: '查询特定列',
          content: `
            <h2>查询特定列</h2>
            <p>上一节我们学了用 <code>*</code> 查询所有列。但很多时候，我们只需要表中的<strong>某几列</strong>数据。</p>

            <h3>基本语法</h3>
            <div class="tutorial-code">SELECT 列名1, 列名2 FROM 表名;</div>
            <p>把 <code>*</code> 换成你想要的列名，多个列名之间用<strong>逗号</strong>隔开。</p>

            <h3>实际例子</h3>
            <p>还是用 <code>students</code> 表：</p>
            <div class="tutorial-example">
              <table class="tutorial-table">
                <thead><tr><th>id</th><th>name</th><th>age</th><th>grade</th></tr></thead>
                <tbody>
                  <tr><td>1</td><td>小明</td><td>18</td><td>高三</td></tr>
                  <tr><td>2</td><td>小红</td><td>17</td><td>高二</td></tr>
                  <tr><td>3</td><td>小华</td><td>18</td><td>高三</td></tr>
                  <tr><td>4</td><td>小丽</td><td>16</td><td>高一</td></tr>
                </tbody>
              </table>
            </div>

            <p>如果我们只想看学生的<strong>姓名和年龄</strong>：</p>
            <div class="tutorial-code">SELECT name, age FROM students;</div>
            <p>结果如下：</p>
            <div class="tutorial-example">
              <table class="tutorial-table">
                <thead><tr><th>name</th><th>age</th></tr></thead>
                <tbody>
                  <tr><td>小明</td><td>18</td></tr>
                  <tr><td>小红</td><td>17</td></tr>
                  <tr><td>小华</td><td>18</td></tr>
                  <tr><td>小丽</td><td>16</td></tr>
                </tbody>
              </table>
            </div>

            <h3>为什么不总是用 * ？</h3>
            <ul>
              <li><strong>性能更好</strong>：只查需要的列，数据库处理更快</li>
              <li><strong>更清晰</strong>：让阅读SQL的人一眼知道你需要什么数据</li>
              <li><strong>数据安全</strong>：避免意外暴露敏感列（比如密码列）</li>
            </ul>

            <div class="tutorial-tip">
              <strong>试一试：</strong>试试只查询学生的姓名和年龄吧！
            </div>
          `,
          exercise: {
            description: '只查询 students 表中所有学生的姓名和年龄',
            setupSQL: 'CREATE TABLE students (id INTEGER, name TEXT, age INTEGER, grade TEXT); INSERT INTO students VALUES (1, "小明", 18, "高三"); INSERT INTO students VALUES (2, "小红", 17, "高二"); INSERT INTO students VALUES (3, "小华", 18, "高三"); INSERT INTO students VALUES (4, "小丽", 16, "高一");',
            answer: 'SELECT name, age FROM students;',
            hint: '使用 SELECT 列名1, 列名2 FROM 表名'
          }
        },
        {
          id: '2-3',
          title: '用 AS 给列起别名',
          content: `
            <h2>用 AS 给列起别名</h2>
            <p>有时候列名是英文的，或者不够直观。我们可以用 <code>AS</code> 给查询结果的列<strong>起一个别名</strong>，让结果更好懂。</p>

            <h3>基本语法</h3>
            <div class="tutorial-code">SELECT 列名 AS 别名 FROM 表名;</div>

            <h3>实际例子</h3>
            <p>把英文列名替换成中文：</p>
            <div class="tutorial-code">SELECT name AS 姓名, age AS 年龄 FROM students;</div>
            <p>结果：</p>
            <div class="tutorial-example">
              <table class="tutorial-table">
                <thead><tr><th>姓名</th><th>年龄</th></tr></thead>
                <tbody>
                  <tr><td>小明</td><td>18</td></tr>
                  <tr><td>小红</td><td>17</td></tr>
                  <tr><td>小华</td><td>18</td></tr>
                  <tr><td>小丽</td><td>16</td></tr>
                </tbody>
              </table>
            </div>
            <p>注意：别名<strong>不会改变</strong>数据库中真正的列名，只是让查询结果显示得更好看。</p>

            <div class="tutorial-tip">
              <strong>试一试：</strong>查询所有学生的姓名（别名为"学生姓名"）和年级（别名为"所在年级"）。
            </div>
          `,
          exercise: {
            description: '查询所有学生的姓名（别名为"学生姓名"）和年级（别名为"所在年级"）',
            setupSQL: 'CREATE TABLE students (id INTEGER, name TEXT, age INTEGER, grade TEXT); INSERT INTO students VALUES (1, "小明", 18, "高三"); INSERT INTO students VALUES (2, "小红", 17, "高二"); INSERT INTO students VALUES (3, "小华", 18, "高三"); INSERT INTO students VALUES (4, "小丽", 16, "高一");',
            answer: 'SELECT name AS 学生姓名, grade AS 所在年级 FROM students;',
            hint: '使用 SELECT 列名 AS 别名 的格式，例如 SELECT name AS 学生姓名'
          }
        }
      ]
    },

    // ========================================
    // Chapter 3: WHERE 条件筛选
    // ========================================
    {
      id: '3',
      title: '第3章：WHERE 条件筛选',
      lessons: [
        {
          id: '3-1',
          title: '用 WHERE 筛选数据',
          content: `
            <h2>WHERE —— 给查询加条件</h2>
            <p>到目前为止，我们查询的都是<strong>所有数据</strong>。但在实际使用中，我们通常只需要满足特定条件的数据。这时候就要用到 <code>WHERE</code> 关键字。</p>

            <h3>基本语法</h3>
            <div class="tutorial-code">SELECT 列名 FROM 表名 WHERE 条件;</div>

            <h3>常用的比较运算符</h3>
            <div class="tutorial-example">
              <table class="tutorial-table">
                <thead><tr><th>运算符</th><th>含义</th><th>例子</th></tr></thead>
                <tbody>
                  <tr><td>=</td><td>等于</td><td>age = 18</td></tr>
                  <tr><td>!=</td><td>不等于</td><td>grade != '高三'</td></tr>
                  <tr><td>&gt;</td><td>大于</td><td>age > 17</td></tr>
                  <tr><td>&lt;</td><td>小于</td><td>age < 18</td></tr>
                  <tr><td>&gt;=</td><td>大于等于</td><td>age >= 17</td></tr>
                  <tr><td>&lt;=</td><td>小于等于</td><td>age <= 18</td></tr>
                </tbody>
              </table>
            </div>

            <h3>实际例子</h3>
            <p>查找所有18岁的学生：</p>
            <div class="tutorial-code">SELECT * FROM students WHERE age = 18;</div>
            <p>结果：</p>
            <div class="tutorial-example">
              <table class="tutorial-table">
                <thead><tr><th>id</th><th>name</th><th>age</th><th>grade</th></tr></thead>
                <tbody>
                  <tr><td>1</td><td>小明</td><td>18</td><td>高三</td></tr>
                  <tr><td>3</td><td>小华</td><td>18</td><td>高三</td></tr>
                </tbody>
              </table>
            </div>

            <p>查找所有高二的学生：</p>
            <div class="tutorial-code">SELECT * FROM students WHERE grade = '高二';</div>
            <p><strong>注意</strong>：文字类型的值需要用<strong>单引号</strong>包裹，数字不用。</p>

            <div class="tutorial-tip">
              <strong>试一试：</strong>查询所有年龄大于等于18岁的学生的所有信息。
            </div>
          `,
          exercise: {
            description: '查询所有年龄大于等于18岁的学生的所有信息',
            setupSQL: 'CREATE TABLE students (id INTEGER, name TEXT, age INTEGER, grade TEXT); INSERT INTO students VALUES (1, "小明", 18, "高三"); INSERT INTO students VALUES (2, "小红", 17, "高二"); INSERT INTO students VALUES (3, "小华", 18, "高三"); INSERT INTO students VALUES (4, "小丽", 16, "高一");',
            answer: 'SELECT * FROM students WHERE age >= 18;',
            hint: '使用 WHERE age >= 18 来筛选年龄大于等于18的记录'
          }
        },
        {
          id: '3-2',
          title: 'AND 和 OR 组合条件',
          content: `
            <h2>AND 和 OR —— 组合多个条件</h2>
            <p>有时候一个条件不够用，我们需要同时满足<strong>多个条件</strong>，或者满足其中<strong>一个条件</strong>就行。这时候就用到 <code>AND</code> 和 <code>OR</code>。</p>

            <h3>AND（同时满足）</h3>
            <div class="tutorial-code">SELECT * FROM students WHERE 条件1 AND 条件2;</div>
            <p>只有<strong>两个条件都满足</strong>的记录才会被返回。</p>

            <p>例如，查找18岁<strong>并且</strong>是高三的学生：</p>
            <div class="tutorial-code">SELECT * FROM students WHERE age = 18 AND grade = '高三';</div>

            <h3>OR（满足其一）</h3>
            <div class="tutorial-code">SELECT * FROM students WHERE 条件1 OR 条件2;</div>
            <p>只要满足<strong>其中一个条件</strong>就会被返回。</p>

            <p>例如，查找高一<strong>或者</strong>高二的学生：</p>
            <div class="tutorial-code">SELECT * FROM students WHERE grade = '高一' OR grade = '高二';</div>
            <p>结果：</p>
            <div class="tutorial-example">
              <table class="tutorial-table">
                <thead><tr><th>id</th><th>name</th><th>age</th><th>grade</th></tr></thead>
                <tbody>
                  <tr><td>2</td><td>小红</td><td>17</td><td>高二</td></tr>
                  <tr><td>4</td><td>小丽</td><td>16</td><td>高一</td></tr>
                </tbody>
              </table>
            </div>

            <h3>AND 和 OR 混合使用</h3>
            <p>可以用括号来明确优先级：</p>
            <div class="tutorial-code">SELECT * FROM students WHERE (grade = '高三' OR grade = '高二') AND age >= 17;</div>

            <div class="tutorial-tip">
              <strong>试一试：</strong>查询所有年龄等于17岁或者年龄等于16岁的学生的姓名和年龄。
            </div>
          `,
          exercise: {
            description: '查询所有年龄等于17岁或者年龄等于16岁的学生的姓名和年龄',
            setupSQL: 'CREATE TABLE students (id INTEGER, name TEXT, age INTEGER, grade TEXT); INSERT INTO students VALUES (1, "小明", 18, "高三"); INSERT INTO students VALUES (2, "小红", 17, "高二"); INSERT INTO students VALUES (3, "小华", 18, "高三"); INSERT INTO students VALUES (4, "小丽", 16, "高一");',
            answer: 'SELECT name, age FROM students WHERE age = 17 OR age = 16;',
            hint: '使用 SELECT name, age FROM students WHERE age = 17 OR age = 16'
          }
        },
        {
          id: '3-3',
          title: 'LIKE 模糊查询',
          content: `
            <h2>LIKE —— 模糊查询</h2>
            <p>有时候我们不知道完整的值，只知道一部分。比如你只记得一个学生的姓是"小"，但不记得全名。这时候就用 <code>LIKE</code> 进行<strong>模糊查询</strong>。</p>

            <h3>通配符</h3>
            <ul>
              <li><code>%</code> —— 代表<strong>任意个字符</strong>（包括零个）</li>
              <li><code>_</code> —— 代表<strong>恰好一个字符</strong></li>
            </ul>

            <h3>常见用法</h3>
            <div class="tutorial-example">
              <table class="tutorial-table">
                <thead><tr><th>表达式</th><th>含义</th></tr></thead>
                <tbody>
                  <tr><td>LIKE '小%'</td><td>以"小"开头的任何值</td></tr>
                  <tr><td>LIKE '%三'</td><td>以"三"结尾的任何值</td></tr>
                  <tr><td>LIKE '%明%'</td><td>包含"明"的任何值</td></tr>
                  <tr><td>LIKE '小_'</td><td>以"小"开头且只有两个字的值</td></tr>
                </tbody>
              </table>
            </div>

            <h3>实际例子</h3>
            <p>查找所有名字以"小"开头的学生：</p>
            <div class="tutorial-code">SELECT * FROM students WHERE name LIKE '小%';</div>
            <p>这会返回"小明"、"小红"、"小华"、"小丽"所有人，因为他们的名字都以"小"开头。</p>

            <p>查找所有年级中包含"三"的学生：</p>
            <div class="tutorial-code">SELECT * FROM students WHERE grade LIKE '%三%';</div>
            <p>结果：只返回"高三"的学生。</p>

            <div class="tutorial-tip">
              <strong>试一试：</strong>查询所有年级以"高"开头的学生的姓名和年级（其实这里所有学生都满足，因为年级都是"高X"的格式）。
            </div>
          `,
          exercise: {
            description: '查询名字中包含"明"的学生的所有信息',
            setupSQL: 'CREATE TABLE students (id INTEGER, name TEXT, age INTEGER, grade TEXT); INSERT INTO students VALUES (1, "小明", 18, "高三"); INSERT INTO students VALUES (2, "小红", 17, "高二"); INSERT INTO students VALUES (3, "小华", 18, "高三"); INSERT INTO students VALUES (4, "小丽", 16, "高一"); INSERT INTO students VALUES (5, "明辉", 19, "大一");',
            answer: "SELECT * FROM students WHERE name LIKE '%明%';",
            hint: "使用 LIKE '%明%' 来查找名字中包含\"明\"的记录"
          }
        }
      ]
    },

    // ========================================
    // Chapter 4: 排序与聚合
    // ========================================
    {
      id: '4',
      title: '第4章：排序与聚合函数',
      lessons: [
        {
          id: '4-1',
          title: 'ORDER BY 排序',
          content: `
            <h2>ORDER BY —— 给结果排序</h2>
            <p>默认情况下，查询结果的顺序是不确定的。如果你想让结果按某个列<strong>排序</strong>，就需要用 <code>ORDER BY</code>。</p>

            <h3>基本语法</h3>
            <div class="tutorial-code">SELECT * FROM 表名 ORDER BY 列名;</div>
            <p>默认是<strong>升序</strong>（从小到大），也可以指定排序方向：</p>
            <ul>
              <li><code>ASC</code> —— 升序（默认，可以不写）</li>
              <li><code>DESC</code> —— 降序（从大到小）</li>
            </ul>

            <h3>实际例子</h3>
            <p>假设有一个 <code>products</code> 表：</p>
            <div class="tutorial-example">
              <table class="tutorial-table">
                <thead><tr><th>id</th><th>name</th><th>price</th><th>stock</th></tr></thead>
                <tbody>
                  <tr><td>1</td><td>笔记本</td><td>15</td><td>100</td></tr>
                  <tr><td>2</td><td>钢笔</td><td>45</td><td>50</td></tr>
                  <tr><td>3</td><td>铅笔</td><td>3</td><td>200</td></tr>
                  <tr><td>4</td><td>橡皮</td><td>2</td><td>300</td></tr>
                  <tr><td>5</td><td>书包</td><td>120</td><td>30</td></tr>
                </tbody>
              </table>
            </div>

            <p>按价格从低到高排序：</p>
            <div class="tutorial-code">SELECT * FROM products ORDER BY price ASC;</div>

            <p>按价格从高到低排序：</p>
            <div class="tutorial-code">SELECT * FROM products ORDER BY price DESC;</div>

            <p>还可以先按一列排，再按另一列排：</p>
            <div class="tutorial-code">SELECT * FROM products ORDER BY price DESC, stock ASC;</div>

            <div class="tutorial-tip">
              <strong>试一试：</strong>查询 products 表中所有商品，按价格从高到低排序。
            </div>
          `,
          exercise: {
            description: '查询 products 表中所有商品，按价格从高到低排序',
            setupSQL: 'CREATE TABLE products (id INTEGER, name TEXT, price INTEGER, stock INTEGER); INSERT INTO products VALUES (1, "笔记本", 15, 100); INSERT INTO products VALUES (2, "钢笔", 45, 50); INSERT INTO products VALUES (3, "铅笔", 3, 200); INSERT INTO products VALUES (4, "橡皮", 2, 300); INSERT INTO products VALUES (5, "书包", 120, 30);',
            answer: 'SELECT * FROM products ORDER BY price DESC;',
            hint: '使用 ORDER BY price DESC 来按价格降序排列'
          }
        },
        {
          id: '4-2',
          title: 'COUNT, SUM, AVG 聚合函数',
          content: `
            <h2>聚合函数 —— 统计数据</h2>
            <p>有时候我们不需要看每一行的详细数据，而是想知道一些<strong>统计结果</strong>。比如："一共有多少学生？""平均年龄是多少？"这时候就要用到<strong>聚合函数</strong>。</p>

            <h3>常用聚合函数</h3>
            <div class="tutorial-example">
              <table class="tutorial-table">
                <thead><tr><th>函数</th><th>作用</th><th>例子</th></tr></thead>
                <tbody>
                  <tr><td>COUNT(*)</td><td>统计行数</td><td>一共有多少条记录</td></tr>
                  <tr><td>SUM(列名)</td><td>求和</td><td>所有商品的总库存</td></tr>
                  <tr><td>AVG(列名)</td><td>求平均值</td><td>商品的平均价格</td></tr>
                  <tr><td>MAX(列名)</td><td>最大值</td><td>最贵的商品价格</td></tr>
                  <tr><td>MIN(列名)</td><td>最小值</td><td>最便宜的商品价格</td></tr>
                </tbody>
              </table>
            </div>

            <h3>实际例子</h3>
            <p>使用 products 表：</p>

            <p>统计商品总数：</p>
            <div class="tutorial-code">SELECT COUNT(*) AS 商品总数 FROM products;</div>
            <p>结果：<strong>5</strong></p>

            <p>计算所有商品的平均价格：</p>
            <div class="tutorial-code">SELECT AVG(price) AS 平均价格 FROM products;</div>
            <p>结果：<strong>37.0</strong>（(15+45+3+2+120)/5）</p>

            <p>求总库存量：</p>
            <div class="tutorial-code">SELECT SUM(stock) AS 总库存 FROM products;</div>
            <p>结果：<strong>680</strong></p>

            <p>找出最贵的商品价格：</p>
            <div class="tutorial-code">SELECT MAX(price) AS 最高价 FROM products;</div>
            <p>结果：<strong>120</strong></p>

            <div class="tutorial-tip">
              <strong>试一试：</strong>查询 products 表中商品的总数、平均价格和总库存量。
            </div>
          `,
          exercise: {
            description: '查询 products 表中商品的总数（别名为"商品总数"）、平均价格（别名为"平均价格"）和总库存量（别名为"总库存"）',
            setupSQL: 'CREATE TABLE products (id INTEGER, name TEXT, price INTEGER, stock INTEGER); INSERT INTO products VALUES (1, "笔记本", 15, 100); INSERT INTO products VALUES (2, "钢笔", 45, 50); INSERT INTO products VALUES (3, "铅笔", 3, 200); INSERT INTO products VALUES (4, "橡皮", 2, 300); INSERT INTO products VALUES (5, "书包", 120, 30);',
            answer: 'SELECT COUNT(*) AS 商品总数, AVG(price) AS 平均价格, SUM(stock) AS 总库存 FROM products;',
            hint: '使用 SELECT COUNT(*) AS 商品总数, AVG(price) AS 平均价格, SUM(stock) AS 总库存 FROM products'
          }
        },
        {
          id: '4-3',
          title: 'GROUP BY 分组统计',
          content: `
            <h2>GROUP BY —— 分组统计</h2>
            <p>聚合函数默认对<strong>整张表</strong>进行统计。但如果我们想按<strong>某个类别</strong>分别统计呢？比如"每个年级有多少学生？"这时候就用 <code>GROUP BY</code>。</p>

            <h3>基本语法</h3>
            <div class="tutorial-code">SELECT 分组列, 聚合函数 FROM 表名 GROUP BY 分组列;</div>

            <h3>实际例子</h3>
            <p>统计每个年级有多少学生：</p>
            <div class="tutorial-code">SELECT grade, COUNT(*) AS 人数 FROM students GROUP BY grade;</div>
            <p>结果：</p>
            <div class="tutorial-example">
              <table class="tutorial-table">
                <thead><tr><th>grade</th><th>人数</th></tr></thead>
                <tbody>
                  <tr><td>高一</td><td>1</td></tr>
                  <tr><td>高二</td><td>1</td></tr>
                  <tr><td>高三</td><td>2</td></tr>
                </tbody>
              </table>
            </div>

            <p>统计每个年级的平均年龄：</p>
            <div class="tutorial-code">SELECT grade, AVG(age) AS 平均年龄 FROM students GROUP BY grade;</div>

            <h3>GROUP BY + ORDER BY 组合</h3>
            <p>可以对分组的结果进行排序：</p>
            <div class="tutorial-code">SELECT grade, COUNT(*) AS 人数
FROM students
GROUP BY grade
ORDER BY 人数 DESC;</div>
            <p>这样会按照人数从多到少排列。</p>

            <div class="tutorial-tip">
              <strong>试一试：</strong>统计每个年级的学生人数，并按照人数从多到少排序。
            </div>
          `,
          exercise: {
            description: '统计每个年级的学生人数（别名为"人数"），按照人数从多到少排序',
            setupSQL: 'CREATE TABLE students (id INTEGER, name TEXT, age INTEGER, grade TEXT); INSERT INTO students VALUES (1, "小明", 18, "高三"); INSERT INTO students VALUES (2, "小红", 17, "高二"); INSERT INTO students VALUES (3, "小华", 18, "高三"); INSERT INTO students VALUES (4, "小丽", 16, "高一"); INSERT INTO students VALUES (5, "小亮", 18, "高三"); INSERT INTO students VALUES (6, "小美", 17, "高二");',
            answer: 'SELECT grade, COUNT(*) AS 人数 FROM students GROUP BY grade ORDER BY 人数 DESC;',
            hint: '使用 GROUP BY grade 分组，COUNT(*) AS 人数 统计，ORDER BY 人数 DESC 排序'
          }
        }
      ]
    },

    // ========================================
    // Chapter 5: JOIN 多表查询
    // ========================================
    {
      id: '5',
      title: '第5章：JOIN 多表查询',
      lessons: [
        {
          id: '5-1',
          title: '为什么需要多张表？',
          content: `
            <h2>为什么需要多张表？</h2>
            <p>在真实的数据库中，数据通常不会全部放在一张表里。比如一个学校的系统，可能有这样的表：</p>
            <ul>
              <li><strong>students</strong> 表 —— 存学生信息</li>
              <li><strong>courses</strong> 表 —— 存课程信息</li>
              <li><strong>scores</strong> 表 —— 存成绩信息（连接学生和课程）</li>
            </ul>

            <p>为什么要分开存呢？因为：</p>
            <ul>
              <li><strong>减少重复</strong>：如果把课程名写在每条成绩记录里，同一个课程名要写很多遍</li>
              <li><strong>方便修改</strong>：课程名改了，只需要改courses表一处就行</li>
              <li><strong>结构清晰</strong>：每张表只负责一种信息</li>
            </ul>

            <h3>表之间的关系</h3>
            <p>通常用 <strong>id（主键）</strong>来连接不同的表。比如：</p>
            <div class="tutorial-example">
              <p><strong>students 表：</strong></p>
              <table class="tutorial-table">
                <thead><tr><th>id</th><th>name</th><th>age</th></tr></thead>
                <tbody>
                  <tr><td>1</td><td>小明</td><td>18</td></tr>
                  <tr><td>2</td><td>小红</td><td>17</td></tr>
                </tbody>
              </table>
              <p style="margin-top:12px"><strong>scores 表：</strong></p>
              <table class="tutorial-table">
                <thead><tr><th>id</th><th>student_id</th><th>subject</th><th>score</th></tr></thead>
                <tbody>
                  <tr><td>1</td><td>1</td><td>数学</td><td>95</td></tr>
                  <tr><td>2</td><td>1</td><td>语文</td><td>88</td></tr>
                  <tr><td>3</td><td>2</td><td>数学</td><td>92</td></tr>
                  <tr><td>4</td><td>2</td><td>语文</td><td>90</td></tr>
                </tbody>
              </table>
            </div>
            <p>这里 scores 表中的 <code>student_id</code> 对应 students 表中的 <code>id</code>。</p>

            <h3>JOIN —— 连接两张表</h3>
            <p><code>JOIN</code>（也叫<code>INNER JOIN</code>）可以把两张表根据某个条件"合并"在一起查询：</p>
            <div class="tutorial-code">SELECT students.name, scores.subject, scores.score
FROM students
JOIN scores ON students.id = scores.student_id;</div>
            <p>结果：</p>
            <div class="tutorial-example">
              <table class="tutorial-table">
                <thead><tr><th>name</th><th>subject</th><th>score</th></tr></thead>
                <tbody>
                  <tr><td>小明</td><td>数学</td><td>95</td></tr>
                  <tr><td>小明</td><td>语文</td><td>88</td></tr>
                  <tr><td>小红</td><td>数学</td><td>92</td></tr>
                  <tr><td>小红</td><td>语文</td><td>90</td></tr>
                </tbody>
              </table>
            </div>
            <p><code>ON</code> 后面的条件指定了两张表是怎么关联的。</p>

            <div class="tutorial-tip">
              <strong>试一试：</strong>用JOIN查询每个学生的姓名和成绩，显示学生姓名、科目和分数。
            </div>
          `,
          exercise: {
            description: '用JOIN查询每个学生的姓名、科目和分数',
            setupSQL: 'CREATE TABLE students (id INTEGER, name TEXT, age INTEGER); INSERT INTO students VALUES (1, "小明", 18); INSERT INTO students VALUES (2, "小红", 17); INSERT INTO students VALUES (3, "小华", 18); CREATE TABLE scores (id INTEGER, student_id INTEGER, subject TEXT, score INTEGER); INSERT INTO scores VALUES (1, 1, "数学", 95); INSERT INTO scores VALUES (2, 1, "语文", 88); INSERT INTO scores VALUES (3, 2, "数学", 92); INSERT INTO scores VALUES (4, 2, "语文", 90); INSERT INTO scores VALUES (5, 3, "数学", 78); INSERT INTO scores VALUES (6, 3, "语文", 85);',
            answer: 'SELECT students.name, scores.subject, scores.score FROM students JOIN scores ON students.id = scores.student_id;',
            hint: '使用 SELECT students.name, scores.subject, scores.score FROM students JOIN scores ON students.id = scores.student_id'
          }
        },
        {
          id: '5-2',
          title: 'JOIN 进阶与实战',
          content: `
            <h2>JOIN 进阶 —— 结合 WHERE 和聚合</h2>
            <p>JOIN 可以和之前学过的 WHERE、GROUP BY、ORDER BY 一起使用，这让我们能做更复杂的查询。</p>

            <h3>JOIN + WHERE</h3>
            <p>查询小明的所有成绩：</p>
            <div class="tutorial-code">SELECT students.name, scores.subject, scores.score
FROM students
JOIN scores ON students.id = scores.student_id
WHERE students.name = '小明';</div>

            <h3>JOIN + GROUP BY + 聚合函数</h3>
            <p>计算每个学生的平均分：</p>
            <div class="tutorial-code">SELECT students.name, AVG(scores.score) AS 平均分
FROM students
JOIN scores ON students.id = scores.student_id
GROUP BY students.name;</div>
            <p>结果：</p>
            <div class="tutorial-example">
              <table class="tutorial-table">
                <thead><tr><th>name</th><th>平均分</th></tr></thead>
                <tbody>
                  <tr><td>小明</td><td>91.5</td></tr>
                  <tr><td>小红</td><td>91.0</td></tr>
                  <tr><td>小华</td><td>81.5</td></tr>
                </tbody>
              </table>
            </div>

            <h3>JOIN + ORDER BY</h3>
            <p>查询所有成绩，按分数从高到低排列：</p>
            <div class="tutorial-code">SELECT students.name, scores.subject, scores.score
FROM students
JOIN scores ON students.id = scores.student_id
ORDER BY scores.score DESC;</div>

            <div class="tutorial-tip">
              <strong>试一试：</strong>计算每个学生的平均分，按照平均分从高到低排序，显示学生姓名和平均分。
            </div>
          `,
          exercise: {
            description: '计算每个学生的平均分（别名"平均分"），按平均分从高到低排序，显示学生姓名和平均分',
            setupSQL: 'CREATE TABLE students (id INTEGER, name TEXT, age INTEGER); INSERT INTO students VALUES (1, "小明", 18); INSERT INTO students VALUES (2, "小红", 17); INSERT INTO students VALUES (3, "小华", 18); CREATE TABLE scores (id INTEGER, student_id INTEGER, subject TEXT, score INTEGER); INSERT INTO scores VALUES (1, 1, "数学", 95); INSERT INTO scores VALUES (2, 1, "语文", 88); INSERT INTO scores VALUES (3, 2, "数学", 92); INSERT INTO scores VALUES (4, 2, "语文", 90); INSERT INTO scores VALUES (5, 3, "数学", 78); INSERT INTO scores VALUES (6, 3, "语文", 85);',
            answer: 'SELECT students.name, AVG(scores.score) AS 平均分 FROM students JOIN scores ON students.id = scores.student_id GROUP BY students.name ORDER BY 平均分 DESC;',
            hint: '使用 JOIN 连接两表，GROUP BY students.name 分组，AVG(scores.score) AS 平均分，ORDER BY 平均分 DESC 排序'
          }
        }
      ]
    },

    // ========================================
    // Chapter 6: 数据操作 INSERT, UPDATE, DELETE
    // ========================================
    {
      id: '6',
      title: '第6章：数据增删改',
      lessons: [
        {
          id: '6-1',
          title: 'INSERT 插入数据',
          content: `
            <h2>INSERT —— 插入新数据</h2>
            <p>之前我们都在查询已有的数据。现在来学习如何<strong>向表中添加新数据</strong>。</p>

            <h3>基本语法</h3>
            <div class="tutorial-code">INSERT INTO 表名 (列名1, 列名2, ...) VALUES (值1, 值2, ...);</div>
            <p>也可以省略列名（但必须按照列的顺序提供所有值）：</p>
            <div class="tutorial-code">INSERT INTO 表名 VALUES (值1, 值2, ...);</div>

            <h3>实际例子</h3>
            <p>向 students 表中添加一个新学生：</p>
            <div class="tutorial-code">INSERT INTO students (id, name, age, grade)
VALUES (5, '小刚', 17, '高二');</div>

            <p>或者省略列名：</p>
            <div class="tutorial-code">INSERT INTO students VALUES (5, '小刚', 17, '高二');</div>

            <h3>注意事项</h3>
            <ul>
              <li>值的<strong>数量和顺序</strong>必须与列名一一对应</li>
              <li>文字类型要用<strong>单引号</strong>包裹</li>
              <li>数字类型<strong>不用</strong>引号</li>
              <li>插入后可以用 <code>SELECT</code> 查看结果</li>
            </ul>

            <h3>插入多条数据</h3>
            <p>一次插入多条：</p>
            <div class="tutorial-code">INSERT INTO students VALUES (5, '小刚', 17, '高二');
INSERT INTO students VALUES (6, '小芳', 16, '高一');</div>

            <div class="tutorial-tip">
              <strong>试一试：</strong>向 students 表中插入一条新记录（id=5, name='小刚', age=17, grade='高二'），然后查询所有数据看看结果。
            </div>
          `,
          exercise: {
            description: "向 students 表中插入一条新记录（id=5, name='小刚', age=17, grade='高二'），然后查询所有数据",
            setupSQL: 'CREATE TABLE students (id INTEGER, name TEXT, age INTEGER, grade TEXT); INSERT INTO students VALUES (1, "小明", 18, "高三"); INSERT INTO students VALUES (2, "小红", 17, "高二"); INSERT INTO students VALUES (3, "小华", 18, "高三"); INSERT INTO students VALUES (4, "小丽", 16, "高一");',
            answer: "INSERT INTO students VALUES (5, '小刚', 17, '高二'); SELECT * FROM students;",
            hint: "先用 INSERT INTO students VALUES (5, '小刚', 17, '高二'); 插入数据，再用 SELECT * FROM students; 查询"
          }
        },
        {
          id: '6-2',
          title: 'UPDATE 修改数据',
          content: `
            <h2>UPDATE —— 修改已有数据</h2>
            <p>当数据需要更新时（比如学生升级了、商品涨价了），我们用 <code>UPDATE</code> 来修改。</p>

            <h3>基本语法</h3>
            <div class="tutorial-code">UPDATE 表名 SET 列名 = 新值 WHERE 条件;</div>

            <h3>重要提醒</h3>
            <div class="tutorial-warning">
              <strong>警告：</strong>UPDATE 语句一定要带 <code>WHERE</code> 条件！如果不写 WHERE，会把整张表的数据都改掉！
            </div>

            <h3>实际例子</h3>
            <p>把小明的年龄改为19：</p>
            <div class="tutorial-code">UPDATE students SET age = 19 WHERE name = '小明';</div>

            <p>同时修改多个列：</p>
            <div class="tutorial-code">UPDATE students SET age = 19, grade = '大一' WHERE name = '小明';</div>

            <h3>验证修改结果</h3>
            <p>修改后，用 SELECT 查看：</p>
            <div class="tutorial-code">UPDATE students SET age = 19 WHERE name = '小明';
SELECT * FROM students WHERE name = '小明';</div>
            <p>结果：</p>
            <div class="tutorial-example">
              <table class="tutorial-table">
                <thead><tr><th>id</th><th>name</th><th>age</th><th>grade</th></tr></thead>
                <tbody>
                  <tr><td>1</td><td>小明</td><td>19</td><td>高三</td></tr>
                </tbody>
              </table>
            </div>

            <div class="tutorial-tip">
              <strong>试一试：</strong>把小丽的年级从"高一"改为"高二"，然后查询所有数据验证。
            </div>
          `,
          exercise: {
            description: "把小丽的年级从'高一'改为'高二'，然后查询所有数据",
            setupSQL: 'CREATE TABLE students (id INTEGER, name TEXT, age INTEGER, grade TEXT); INSERT INTO students VALUES (1, "小明", 18, "高三"); INSERT INTO students VALUES (2, "小红", 17, "高二"); INSERT INTO students VALUES (3, "小华", 18, "高三"); INSERT INTO students VALUES (4, "小丽", 16, "高一");',
            answer: "UPDATE students SET grade = '高二' WHERE name = '小丽'; SELECT * FROM students;",
            hint: "使用 UPDATE students SET grade = '高二' WHERE name = '小丽'; 然后 SELECT * FROM students;"
          }
        },
        {
          id: '6-3',
          title: 'DELETE 删除数据',
          content: `
            <h2>DELETE —— 删除数据</h2>
            <p>当某些数据不再需要时，用 <code>DELETE</code> 来删除。</p>

            <h3>基本语法</h3>
            <div class="tutorial-code">DELETE FROM 表名 WHERE 条件;</div>

            <h3>重要提醒</h3>
            <div class="tutorial-warning">
              <strong>警告：</strong>DELETE 语句一定要带 <code>WHERE</code> 条件！如果不写 WHERE，会删掉整张表的所有数据！这是非常危险的操作。
            </div>

            <h3>实际例子</h3>
            <p>删除id为4的学生：</p>
            <div class="tutorial-code">DELETE FROM students WHERE id = 4;</div>

            <p>删除所有高一的学生：</p>
            <div class="tutorial-code">DELETE FROM students WHERE grade = '高一';</div>

            <h3>删除后验证</h3>
            <div class="tutorial-code">DELETE FROM students WHERE id = 4;
SELECT * FROM students;</div>
            <p>结果中就不会再有id=4的记录了。</p>

            <h3>小结：完整的CRUD</h3>
            <p>到这里，我们已经学会了SQL的四大基本操作：</p>
            <ul>
              <li><strong>C</strong>reate：<code>INSERT INTO</code> 插入新数据</li>
              <li><strong>R</strong>ead：<code>SELECT</code> 查询数据</li>
              <li><strong>U</strong>pdate：<code>UPDATE</code> 修改数据</li>
              <li><strong>D</strong>elete：<code>DELETE FROM</code> 删除数据</li>
            </ul>
            <p>掌握了这四个操作，你就掌握了SQL最核心的能力！继续加油！</p>

            <div class="tutorial-tip">
              <strong>试一试：</strong>删除所有年龄小于17岁的学生，然后查询所有数据验证。
            </div>
          `,
          exercise: {
            description: '删除所有年龄小于17岁的学生，然后查询所有数据',
            setupSQL: 'CREATE TABLE students (id INTEGER, name TEXT, age INTEGER, grade TEXT); INSERT INTO students VALUES (1, "小明", 18, "高三"); INSERT INTO students VALUES (2, "小红", 17, "高二"); INSERT INTO students VALUES (3, "小华", 18, "高三"); INSERT INTO students VALUES (4, "小丽", 16, "高一");',
            answer: 'DELETE FROM students WHERE age < 17; SELECT * FROM students;',
            hint: '使用 DELETE FROM students WHERE age < 17; 删除数据，然后用 SELECT * FROM students; 查看结果'
          }
        }
      ]
    }
  ]
}
