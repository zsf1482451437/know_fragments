# 构成

> 简单看下jsonschema的构成

![](C:\Users\86131\Desktop\M8ZCES5.gif)

不难发现，jsonschema表单由 **JSONSchema、UISchema、formData**构成。



接着，看个案例

![image-20231222155959282](C:\Users\86131\Desktop\know_fragments\md-img\image-20231222155959282.png)

相应的JSONSchema、UISchema、FormData如下：

> JSONSchema

```json
{
  "title": "Json Schema表单",
  "description": "定制性更强",
  "type": "object",
  "required": [
    "companyName",
    "establishedDate",
    "employees"
  ],
  "properties": {
    "companyName": {
      "type": "string",
      "title": "公司名称"
    },
    "employees": {
      "type": "integer",
      "title": "员工人数"
    },
    "establishedDate": {
      "type": "string",
      "title": "成立日期"
    }
  }
}
```

> UISchema

```json
{
  "companyName": {
    "ui:widget": "text",
    "ui:placeholder": "请输入公司名称",
    "ui:description": "请输入公司的全名"
  },
  "establishedDate": {
    "ui:widget": "date",
    "ui:description": "请选择公司成立的日期"
  },
  "employees": {
    "ui:widget": "updown",
    "ui:description": "请输入员工总数，必须是整数"
  }
}
```

> formData

```json
{
  "companyName": "",
  "establishedDate": "",
  "employees": 0
}
```

## JSONSchema

它描述了表单的**字段**、**字段类型**和**校验规则**。

上述JSONSchema中，**properties**属性描述了表单有companyName、employees、establishedDate字段；

而**required**属性还描述了其中哪些字段是必填项；

此外，对于companyName字段还有这一段描述：

```json
"companyName": {
	"type": "string",
	"title": "公司名称",
    "minLength": 1
},
```

其中限制了该字段是string类型，在表单中的 `label` 是公司名称，且最小长度为1；

还有其他类型：

- `array`
- `number`
- `integer`
- `boolean`
- `null`

还有其他校验规则：

- maxLength
- max
- min
- 等等

除了这些校验规则，你还可以自定义校验规则

具体详情，请移步官网探索：https://rjsf-team.github.io/react-jsonschema-form/docs/

## UISchema

它描述了字段**如何展示**

```json
"companyName": {
    "ui:widget": "text",
    "ui:placeholder": "请输入公司名称",
    "ui:description": "请输入公司的全名"
  },
```

`"ui:widget": "text"`规定了该字段用text展示，本质是`input[type=text]`，`"ui:placeholder"`规定了提示文本，`"ui:description"`规定了该字段描述信息

widget类型有：

- radio
- select
- color
- textarea
- password
- email
- range
- uri
- date
- file
- 等等

其中 `ui:xxx` 这种写法还有其他属性，具体用途请移步官网探索：https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/uiSchema

## formData

它就是表单数据。

> 提醒：JSONSchema、UISchema、FormData中字段要一一对应

# 演练场

官方还提供了一个演练场：

https://rjsf-team.github.io/react-jsonschema-form/

![image-20231222162538829](C:\Users\86131\Desktop\know_fragments\md-img\image-20231222162538829.png)

更多用途，等你来发现~