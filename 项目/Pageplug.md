# 职责&参与

| 职责                     | 参与 | 使用技术/工具 |
| ------------------------ | ---- | ------------- |
| 文档官网搭建             |      |               |
| 版本更新                 |      |               |
| 打包、部署               |      |               |
| OIDC单点登录             |      |               |
| 微信、企微、钉钉登录     |      |               |
| 树形组件、JSONSchema组件 |      |               |
| 注册登录改动             |      |               |
| 登出全局事件封装         |      |               |



# 技术清单

## 前端

| 框架&集成 |           选型            |      |
| :-------: | :-----------------------: | :--: |
|   框架    |           React           |      |
|  组件库   | ant-design、design-system |      |
| 状态管理  |     Redux、Redux-Saga     |      |
|   打包    |          webpack          |      |
|  可视化   |   Fusioncharts、Echart    |      |
|   测试    |           Jest            |      |

待归类：CodeMirror、blueprintjs、draft-js-plugins、formily、googlemaps、github/g-emoji-element、loadable、manaflair/redux-batch、



| 选型        | 标签             | 说明 |
| ----------- | ---------------- | ---- |
| redux-sagas | *状态管理*       |      |
| redux       | *状态管理*       |      |
| react18     | *JavaScript框架* |      |
| redux-form  |                  |      |

redux-sagas中的takeEvery：`takeEvery` 是 Redux-Saga 中的一个效用函数，用于监听指定的 action 并在每次匹配的 action 被派发时执行一个指定的 generator 函数，它通常用于处理异步操作。

示例：

```ts
import { takeEvery, put, call } from 'redux-saga/effects';
import { someAction, successAction, failureAction } from './actions';
import api from './api';

// Worker Saga: 处理异步操作
function* fetchData(action) {
  try {
    // 调用 API 或执行其他异步操作
    const data = yield call(api.fetchData, action.payload);
    // 成功时派发成功的 action
    yield put(successAction(data));
  } catch (error) {
    // 失败时派发失败的 action
    yield put(failureAction(error));
  }
}

// Watcher Saga: 监听特定 action
function* watchDataFetch() {
  yield takeEvery(someAction, fetchData);
}

// 根 Saga: 将所有的 Saga 合并在一起
export default function* rootSaga() {
  yield all([
    watchDataFetch(),
    // 可以添加其他 Saga
  ]);
}

```



# 理解&设计

## 组件配置的管理

1. 在组件类中,会定义一些静态方法来生成配置面板的配置,比如 `getPropertyPaneConfig`。
2. 这些配置会定义出配置面板中的各个属性,每个属性都会有一个 `propertyName` 来指定属性名。
3. 当用户在配置面板中修改某个属性时,会触发 redux 的 action,将新值存入对应组件的 redux state 中。
4. 组件会监听自己在 redux state 中的数据,一旦发生变更,就会触发重新渲染。
5. 在组件渲染时,会从 redux state 中读取最新的值,传递给相应的组件属性。
6. 这样就完成了从配置面板到组件属性的同步。
7. 对于一些需要转换的属性,组件类中还可以定义 `getDerivedPropertiesMap` 方法来进行转换后再传递给组件。

所以简单来说,配置面板通过 redux 将属性变化反映到组件的 props 中,组件感知到 props 变化后重新渲染,就可以获取到最新的属性值了

## 开发组件流程

### 注册

**utils/widgetRegistry.tsx**

```tsx
import log from "loglevel";
import { registerWidget } from "./WidgetRegisterHelpers";
import AnimationWidget, {
  CONFIG as ANIMATION_WIDGET_CONFIG,
} from "widgets/AnimationWidget";

export const ALL_WIDGETS_AND_CONFIG: [any, WidgetConfiguration][] = [[AnimationWidget, ANIMATION_WIDGET_CONFIG]]

export const registerWidgets = () => {
  const start = performance.now();
  for (const widget of ALL_WIDGETS_AND_CONFIG) {
    registerWidget(widget[0], widget[1] as WidgetConfiguration);
  }

  log.debug("Widget registration took: ", performance.now() - start, "ms");
};
```

**WidgetRegisterHelpers.tsx**

```tsx
import React from "react";

import * as Sentry from "@sentry/react";
import store from "store";

import type BaseWidget from "widgets/BaseWidget";
import WidgetFactory, { NonSerialisableWidgetConfigs } from "./WidgetFactory";

import { ReduxActionTypes } from "@appsmith/constants/ReduxActionConstants";
import { memoize } from "lodash";
import type { WidgetConfiguration } from "widgets/constants";
import withMeta from "widgets/MetaHOC";
import withWidgetProps from "widgets/withWidgetProps";
import { generateReactKey } from "./generators";
import type { RegisteredWidgetFeatures } from "./WidgetFeatures";
import {
  WidgetFeaturePropertyEnhancements,
  WidgetFeatureProps,
} from "./WidgetFeatures";
import { withLazyRender } from "widgets/withLazyRender";

const generateWidget = memoize(function getWidgetComponent(
  Widget: typeof BaseWidget,
  needsMeta: boolean,
  eagerRender: boolean,
) {
  let widget = needsMeta ? withMeta(Widget) : Widget;

  //@ts-expect-error: type mismatch
  widget = withWidgetProps(widget);

  //@ts-expect-error: type mismatch
  widget = eagerRender ? widget : withLazyRender(widget);

  return Sentry.withProfiler(
    // @ts-expect-error: Types are not available
    widget,
  );
});

export const registerWidget = (Widget: any, config: WidgetConfiguration) => {
  const ProfiledWidget = generateWidget(
    Widget,
    !!config.needsMeta,
    !!config.eagerRender,
  );

  WidgetFactory.registerWidgetBuilder(
    config.type,
    {
      buildWidget(widgetData: any): JSX.Element {
        return <ProfiledWidget {...widgetData} key={widgetData.widgetId} />;
      },
    },
    config.properties.derived,
    config.properties.default,
    config.properties.meta,
    config.properties.config,
    config.properties.contentConfig,
    config.properties.styleConfig,
    config.features,
    config.properties.loadingProperties,
    config.properties.stylesheetConfig,
    config.properties.autocompleteDefinitions,
    config.autoLayout,
  );
  configureWidget(config);
};

export const configureWidget = (config: WidgetConfiguration) => {
  let features: Record<string, unknown> = {};
  if (config.features) {
    Object.keys(config.features).forEach((registeredFeature: string) => {
      features = Object.assign(
        {},
        WidgetFeatureProps[registeredFeature as RegisteredWidgetFeatures],
        WidgetFeaturePropertyEnhancements[
          registeredFeature as RegisteredWidgetFeatures
        ](config),
      );
    });
  }

  const _config = {
    ...config.defaults,
    ...features,
    searchTags: config.searchTags,
    type: config.type,
    hideCard: !!config.hideCard || !config.iconSVG,
    isDeprecated: !!config.isDeprecated,
    replacement: config.replacement,
    displayName: config.name,
    key: generateReactKey(),
    iconSVG: config.iconSVG,
    isCanvas: config.isCanvas,
    canvasHeightOffset: config.canvasHeightOffset,
    needsHeightForContent: config.needsHeightForContent,
    isMobile: config.isMobile,
    isScreen: config.isScreen,
  };

  const nonSerialisableWidgetConfigs: Record<string, unknown> = {};
  Object.values(NonSerialisableWidgetConfigs).forEach((entry) => {
    if (_config[entry] !== undefined) {
      nonSerialisableWidgetConfigs[entry] = _config[entry];
    }
    delete _config[entry];
  });

  WidgetFactory.storeNonSerialisablewidgetConfig(
    config.type,
    nonSerialisableWidgetConfigs,
  );
  WidgetFactory.storeWidgetConfig(config.type, _config);

  store.dispatch({
    type: ReduxActionTypes.ADD_WIDGET_CONFIG,
    payload: _config,
  });
};

```

### 属性面板

组件目录的widget/index.tsx的**getPropertyPaneContentConfig**；

返回的数组中元素是对象，对象中children字段又是个数组，该数组元素又是个对象，该对象的**propertyName**字段就是组件的**props**

```tsx
import { Alignment } from "@blueprintjs/core";
import { LabelPosition } from "components/constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { Layers } from "constants/Layers";
import type { TextSize, WidgetType } from "constants/WidgetConstants";
import type { ValidationResponse } from "constants/WidgetValidation";
import { ValidationTypes } from "constants/WidgetValidation";
import type { Stylesheet } from "entities/AppTheming";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { isArray } from "lodash";
import type { DefaultValueType } from "rc-tree-select/lib/interface";
import type { ReactNode } from "react";
import React from "react";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import type { WidgetProps, WidgetState } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import { isAutoLayout } from "utils/autoLayout/flexWidgetUtils";
import { GRID_DENSITY_MIGRATION_V1, MinimumPopupRows } from "widgets/constants";
import {
  isAutoHeightEnabledForWidget,
  DefaultAutocompleteDefinitions,
} from "widgets/WidgetUtils";
import SingleSelectTreeComponent from "../component";
import derivedProperties from "./parseDerivedProperties";
import type { AutocompletionDefinitions } from "widgets/constants";

function defaultOptionValueValidation(value: unknown): ValidationResponse {
  if (typeof value === "string") return { isValid: true, parsed: value.trim() };
  if (value === undefined || value === null)
    return {
      isValid: false,
      parsed: "",
      messages: [
        {
          name: "TypeError",
          message: "This value does not evaluate to type: string",
        },
      ],
    };
  return { isValid: true, parsed: value };
}
class SingleSelectTreeWidget extends BaseWidget<
  SingleSelectTreeWidgetProps,
  WidgetState
> {
  static getPropertyPaneContentConfig() {
    return [
      {
        sectionName: "数据",
        children: [
          {
            helpText: "允许用户多选，每个选项的值必须唯一",
            propertyName: "options",
            label: "选项",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入选项数据",
            isBindProperty: true,
            isTriggerProperty: false,
            isJSConvertible: false,
            validation: {
              type: ValidationTypes.NESTED_OBJECT_ARRAY,
              params: {
                unique: ["value"],
                default: [],
                children: {
                  type: ValidationTypes.OBJECT,
                  params: {
                    allowedKeys: [
                      {
                        name: "label",
                        type: ValidationTypes.TEXT,
                        params: {
                          default: "",
                          required: true,
                        },
                      },
                      {
                        name: "value",
                        type: ValidationTypes.TEXT,
                        params: {
                          default: "",
                        },
                      },
                      {
                        name: "children",
                        type: ValidationTypes.ARRAY,
                        required: false,
                        params: {
                          children: {
                            type: ValidationTypes.OBJECT,
                            params: {
                              allowedKeys: [
                                {
                                  name: "label",
                                  type: ValidationTypes.TEXT,
                                  params: {
                                    default: "",
                                    required: true,
                                  },
                                },
                                {
                                  name: "value",
                                  type: ValidationTypes.TEXT,
                                  params: {
                                    default: "",
                                  },
                                },
                              ],
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            evaluationSubstitutionType:
              EvaluationSubstitutionType.SMART_SUBSTITUTE,
          },
          {
            helpText: "默认选中这个值",
            propertyName: "defaultOptionValue",
            label: "默认选中值",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入选项数据",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.FUNCTION,
              params: {
                fn: defaultOptionValueValidation,
                expected: {
                  type: "value",
                  example: `value1`,
                  autocompleteDataType: AutocompleteDataType.STRING,
                },
              },
            },
          },
        ],
      },
      {
        sectionName: "标签",
        children: [
          {
            helpText: "设置组件标签文本",
            propertyName: "labelText",
            label: "文本",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入文本内容",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "设置组件标签位置",
            propertyName: "labelPosition",
            label: "位置",
            controlType: "ICON_TABS",
            fullWidth: true,
            hidden: isAutoLayout,
            options: [
              { label: "自动", value: LabelPosition.Auto },
              { label: "左", value: LabelPosition.Left },
              { label: "上", value: LabelPosition.Top },
            ],
            defaultValue: LabelPosition.Top,
            isBindProperty: false,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "设置组件标签的对齐方式",
            propertyName: "labelAlignment",
            label: "对齐",
            controlType: "LABEL_ALIGNMENT_OPTIONS",
            options: [
              {
                icon: "LEFT_ALIGN",
                value: Alignment.LEFT,
              },
              {
                icon: "RIGHT_ALIGN",
                value: Alignment.RIGHT,
              },
            ],
            isBindProperty: false,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            hidden: (props: SingleSelectTreeWidgetProps) =>
              props.labelPosition !== LabelPosition.Left,
            dependencies: ["labelPosition"],
          },
          {
            helpText: "设置组件标签占用的列数",
            propertyName: "labelWidth",
            label: "宽度（所占列数）",
            controlType: "NUMERIC_INPUT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            min: 0,
            validation: {
              type: ValidationTypes.NUMBER,
              params: {
                natural: true,
              },
            },
            hidden: (props: SingleSelectTreeWidgetProps) =>
              props.labelPosition !== LabelPosition.Left,
            dependencies: ["labelPosition"],
          },
        ],
      },
      {
        sectionName: "校验",
        children: [
          {
            propertyName: "isRequired",
            label: "必填",
            helpText: "强制用户填写",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
        ],
      },
      {
        sectionName: "属性",
        children: [
          {
            helpText: "提示信息",
            propertyName: "labelTooltip",
            label: "提示",
            controlType: "INPUT_TEXT",
            placeholderText: "添加提示信息",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "设置占位文本",
            propertyName: "placeholderText",
            label: "占位符",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入占位文本",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "控制组件的显示/隐藏",
            propertyName: "isVisible",
            label: "是否显示",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "isDisabled",
            label: "禁用",
            helpText: "让组件不可交互",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "animateLoading",
            label: "加载时显示动画",
            controlType: "SWITCH",
            helpText: "组件依赖的数据加载时显示加载动画",
            defaultValue: true,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "allowClear",
            label: "允许清空",
            helpText: "显示清空按钮用来清空选择",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "expandAll",
            label: "默认展开",
            helpText: "默认展开所有层级的选项",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
        ],
      },
      {
        sectionName: "事件",
        children: [
          {
            helpText: "用户选中一个选项时触发",
            propertyName: "onOptionChange",
            label: "onOptionChange",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
          {
            helpText: "when the dropdown opens",
            propertyName: "onDropdownOpen",
            label: "onDropdownOpen",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
          {
            helpText: "when the dropdown closes",
            propertyName: "onDropdownClose",
            label: "onDropdownClose",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
        ],
      },
    ];
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      accentColor: "{{appsmith.theme.colors.primaryColor}}",
      borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
      boxShadow: "none",
    };
  }

  static getPropertyPaneStyleConfig() {
    return [
      {
        sectionName: "标签样式",
        children: [
          {
            propertyName: "labelTextColor",
            label: "字体颜色",
            helpText: "设置标签字体颜色",
            controlType: "COLOR_PICKER",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "labelTextSize",
            label: "字体大小",
            helpText: "设置标签字体大小",
            controlType: "DROP_DOWN",
            defaultValue: "0.875rem",
            hidden: isAutoLayout,
            options: [
              {
                label: "S",
                value: "0.875rem",
                subText: "0.875rem",
              },
              {
                label: "M",
                value: "1rem",
                subText: "1rem",
              },
              {
                label: "L",
                value: "1.25rem",
                subText: "1.25rem",
              },
              {
                label: "XL",
                value: "1.875rem",
                subText: "1.875rem",
              },
              {
                label: "XXL",
                value: "3rem",
                subText: "3rem",
              },
              {
                label: "3XL",
                value: "3.75rem",
                subText: "3.75rem",
              },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "labelStyle",
            label: "强调",
            helpText: "设置标签字体是否加粗或斜体",
            controlType: "BUTTON_GROUP",
            options: [
              {
                icon: "BOLD_FONT",
                value: "BOLD",
              },
              {
                icon: "ITALICS_FONT",
                value: "ITALIC",
              },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },
      {
        sectionName: "轮廓样式",
        children: [
          {
            propertyName: "accentColor",
            label: "强调色",
            controlType: "COLOR_PICKER",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            invisible: true,
          },
          {
            propertyName: "borderRadius",
            label: "边框圆角",
            helpText: "边框圆角样式",
            controlType: "BORDER_RADIUS_OPTIONS",

            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "boxShadow",
            label: "阴影",
            helpText: "组件轮廓投影",
            controlType: "BOX_SHADOW_OPTIONS",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },
    ];
  }

  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return {
      "!doc":
        "TreeSelect is used to capture user input from a specified list of permitted inputs/Nested Inputs.",
      "!url": "https://docs.appsmith.com/widget-reference/treeselect",
      isVisible: DefaultAutocompleteDefinitions.isVisible,
      selectedOptionValue: {
        "!type": "string",
        "!doc": "The value selected in a treeselect dropdown",
        "!url": "https://docs.appsmith.com/widget-reference/treeselect",
      },
      selectedOptionLabel: {
        "!type": "string",
        "!doc": "The selected option label in a treeselect dropdown",
        "!url": "https://docs.appsmith.com/widget-reference/treeselect",
      },
      isDisabled: "bool",
      isValid: "bool",
      options: "[$__dropdownOption__$]",
    };
  }

  static getDerivedPropertiesMap() {
    return {
      value: `{{this.selectedOptionValue}}`,
      flattenedOptions: `{{(()=>{${derivedProperties.getFlattenedOptions}})()}}`,
      isValid: `{{(()=>{${derivedProperties.getIsValid}})()}}`,
      selectedOptionValue: `{{(()=>{${derivedProperties.getSelectedOptionValue}})()}}`,
      selectedOptionLabel: `{{(()=>{${derivedProperties.getSelectedOptionLabel}})()}}`,
    };
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {
      selectedOption: "defaultOptionValue",
      selectedLabel: "defaultOptionValue",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      selectedOption: undefined,
      selectedLabel: undefined,
      isDirty: false,
    };
  }

  componentDidUpdate(prevProps: SingleSelectTreeWidgetProps): void {
    if (
      this.props.defaultOptionValue !== prevProps.defaultOptionValue &&
      this.props.isDirty
    ) {
      this.props.updateWidgetMetaProperty("isDirty", false);
    }
  }

  getPageView() {
    const options = isArray(this.props.options) ? this.props.options : [];
    const isInvalid =
      "isValid" in this.props && !this.props.isValid && !!this.props.isDirty;
    const dropDownWidth = MinimumPopupRows * this.props.parentColumnSpace;
    const { componentWidth } = this.getComponentDimensions();
    return (
      <SingleSelectTreeComponent
        accentColor={this.props.accentColor}
        allowClear={this.props.allowClear}
        borderRadius={this.props.borderRadius}
        boxShadow={this.props.boxShadow}
        compactMode={
          !(
            (this.props.bottomRow - this.props.topRow) /
              GRID_DENSITY_MIGRATION_V1 >
            1
          )
        }
        disabled={this.props.isDisabled ?? false}
        dropDownWidth={dropDownWidth}
        dropdownStyle={{
          zIndex: Layers.dropdownModalWidget,
        }}
        expandAll={this.props.expandAll}
        isDynamicHeightEnabled={isAutoHeightEnabledForWidget(this.props)}
        isFilterable
        isValid={!isInvalid}
        labelAlignment={this.props.labelAlignment}
        labelPosition={this.props.labelPosition}
        labelStyle={this.props.labelStyle}
        labelText={this.props.labelText}
        labelTextColor={this.props.labelTextColor}
        labelTextSize={this.props.labelTextSize}
        labelTooltip={this.props.labelTooltip}
        labelWidth={this.getLabelWidth()}
        loading={this.props.isLoading}
        onChange={this.onOptionChange}
        onDropdownClose={this.onDropdownClose}
        onDropdownOpen={this.onDropdownOpen}
        options={options}
        placeholder={this.props.placeholderText as string}
        renderMode={this.props.renderMode}
        value={this.props.selectedOptionValue}
        widgetId={this.props.widgetId}
        width={componentWidth}
      />
    );
  }

  onOptionChange = (value?: DefaultValueType, labelList?: ReactNode[]) => {
    if (!this.props.isDirty) {
      this.props.updateWidgetMetaProperty("isDirty", true);
    }

    this.props.updateWidgetMetaProperty("selectedOption", value);
    this.props.updateWidgetMetaProperty("selectedLabel", labelList?.[0] ?? "", {
      triggerPropertyName: "onOptionChange",
      dynamicString: this.props.onOptionChange,
      event: {
        type: EventType.ON_OPTION_CHANGE,
      },
    });
  };

  onDropdownOpen = () => {
    if (this.props.onDropdownOpen) {
      super.executeAction({
        triggerPropertyName: "onDropdownOpen",
        dynamicString: this.props.onDropdownOpen,
        event: {
          type: EventType.ON_DROPDOWN_OPEN,
        },
      });
    }
  };

  onDropdownClose = () => {
    if (this.props.onDropdownClose) {
      super.executeAction({
        triggerPropertyName: "onDropdownClose",
        dynamicString: this.props.onDropdownClose,
        event: {
          type: EventType.ON_DROPDOWN_CLOSE,
        },
      });
    }
  };

  static getWidgetType(): WidgetType {
    return "SINGLE_SELECT_TREE_WIDGET";
  }
}

export interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: DropdownOption[];
}

export interface SingleSelectTreeWidgetProps extends WidgetProps {
  placeholderText?: string;
  selectedIndex?: number;
  options?: DropdownOption[];
  flattenedOptions?: DropdownOption[];
  onOptionChange: string;
  onDropdownOpen?: string;
  onDropdownClose?: string;
  defaultOptionValue: string;
  isRequired: boolean;
  isLoading: boolean;
  allowClear: boolean;
  selectedLabel: string[];
  selectedOption: string | number;
  selectedOptionValue: string;
  selectedOptionLabel: string;
  expandAll: boolean;
  labelText: string;
  labelPosition?: LabelPosition;
  labelAlignment?: Alignment;
  labelWidth?: number;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  labelStyle?: string;
  borderRadius: string;
  boxShadow?: string;
  accentColor: string;
  isDirty?: boolean;
}

export default SingleSelectTreeWidget;

```

### 样式面板

组件目录的widget/index.tsx的**getPropertyPaneStyleConfig**

```tsx
import { Alignment } from "@blueprintjs/core";
import { LabelPosition } from "components/constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { Layers } from "constants/Layers";
import type { TextSize, WidgetType } from "constants/WidgetConstants";
import type { ValidationResponse } from "constants/WidgetValidation";
import { ValidationTypes } from "constants/WidgetValidation";
import type { Stylesheet } from "entities/AppTheming";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { isArray } from "lodash";
import type { DefaultValueType } from "rc-tree-select/lib/interface";
import type { ReactNode } from "react";
import React from "react";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import type { WidgetProps, WidgetState } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import { isAutoLayout } from "utils/autoLayout/flexWidgetUtils";
import { GRID_DENSITY_MIGRATION_V1, MinimumPopupRows } from "widgets/constants";
import {
  isAutoHeightEnabledForWidget,
  DefaultAutocompleteDefinitions,
} from "widgets/WidgetUtils";
import SingleSelectTreeComponent from "../component";
import derivedProperties from "./parseDerivedProperties";
import type { AutocompletionDefinitions } from "widgets/constants";

function defaultOptionValueValidation(value: unknown): ValidationResponse {
  if (typeof value === "string") return { isValid: true, parsed: value.trim() };
  if (value === undefined || value === null)
    return {
      isValid: false,
      parsed: "",
      messages: [
        {
          name: "TypeError",
          message: "This value does not evaluate to type: string",
        },
      ],
    };
  return { isValid: true, parsed: value };
}
class SingleSelectTreeWidget extends BaseWidget<
  SingleSelectTreeWidgetProps,
  WidgetState
> {
  static getPropertyPaneContentConfig() {
    return [
      {
        sectionName: "数据",
        children: [
          {
            helpText: "允许用户多选，每个选项的值必须唯一",
            propertyName: "options",
            label: "选项",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入选项数据",
            isBindProperty: true,
            isTriggerProperty: false,
            isJSConvertible: false,
            validation: {
              type: ValidationTypes.NESTED_OBJECT_ARRAY,
              params: {
                unique: ["value"],
                default: [],
                children: {
                  type: ValidationTypes.OBJECT,
                  params: {
                    allowedKeys: [
                      {
                        name: "label",
                        type: ValidationTypes.TEXT,
                        params: {
                          default: "",
                          required: true,
                        },
                      },
                      {
                        name: "value",
                        type: ValidationTypes.TEXT,
                        params: {
                          default: "",
                        },
                      },
                      {
                        name: "children",
                        type: ValidationTypes.ARRAY,
                        required: false,
                        params: {
                          children: {
                            type: ValidationTypes.OBJECT,
                            params: {
                              allowedKeys: [
                                {
                                  name: "label",
                                  type: ValidationTypes.TEXT,
                                  params: {
                                    default: "",
                                    required: true,
                                  },
                                },
                                {
                                  name: "value",
                                  type: ValidationTypes.TEXT,
                                  params: {
                                    default: "",
                                  },
                                },
                              ],
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            evaluationSubstitutionType:
              EvaluationSubstitutionType.SMART_SUBSTITUTE,
          },
          {
            helpText: "默认选中这个值",
            propertyName: "defaultOptionValue",
            label: "默认选中值",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入选项数据",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.FUNCTION,
              params: {
                fn: defaultOptionValueValidation,
                expected: {
                  type: "value",
                  example: `value1`,
                  autocompleteDataType: AutocompleteDataType.STRING,
                },
              },
            },
          },
        ],
      },
      {
        sectionName: "标签",
        children: [
          {
            helpText: "设置组件标签文本",
            propertyName: "labelText",
            label: "文本",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入文本内容",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "设置组件标签位置",
            propertyName: "labelPosition",
            label: "位置",
            controlType: "ICON_TABS",
            fullWidth: true,
            hidden: isAutoLayout,
            options: [
              { label: "自动", value: LabelPosition.Auto },
              { label: "左", value: LabelPosition.Left },
              { label: "上", value: LabelPosition.Top },
            ],
            defaultValue: LabelPosition.Top,
            isBindProperty: false,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "设置组件标签的对齐方式",
            propertyName: "labelAlignment",
            label: "对齐",
            controlType: "LABEL_ALIGNMENT_OPTIONS",
            options: [
              {
                icon: "LEFT_ALIGN",
                value: Alignment.LEFT,
              },
              {
                icon: "RIGHT_ALIGN",
                value: Alignment.RIGHT,
              },
            ],
            isBindProperty: false,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            hidden: (props: SingleSelectTreeWidgetProps) =>
              props.labelPosition !== LabelPosition.Left,
            dependencies: ["labelPosition"],
          },
          {
            helpText: "设置组件标签占用的列数",
            propertyName: "labelWidth",
            label: "宽度（所占列数）",
            controlType: "NUMERIC_INPUT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            min: 0,
            validation: {
              type: ValidationTypes.NUMBER,
              params: {
                natural: true,
              },
            },
            hidden: (props: SingleSelectTreeWidgetProps) =>
              props.labelPosition !== LabelPosition.Left,
            dependencies: ["labelPosition"],
          },
        ],
      },
      {
        sectionName: "校验",
        children: [
          {
            propertyName: "isRequired",
            label: "必填",
            helpText: "强制用户填写",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
        ],
      },
      {
        sectionName: "属性",
        children: [
          {
            helpText: "提示信息",
            propertyName: "labelTooltip",
            label: "提示",
            controlType: "INPUT_TEXT",
            placeholderText: "添加提示信息",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "设置占位文本",
            propertyName: "placeholderText",
            label: "占位符",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入占位文本",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "控制组件的显示/隐藏",
            propertyName: "isVisible",
            label: "是否显示",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "isDisabled",
            label: "禁用",
            helpText: "让组件不可交互",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "animateLoading",
            label: "加载时显示动画",
            controlType: "SWITCH",
            helpText: "组件依赖的数据加载时显示加载动画",
            defaultValue: true,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "allowClear",
            label: "允许清空",
            helpText: "显示清空按钮用来清空选择",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "expandAll",
            label: "默认展开",
            helpText: "默认展开所有层级的选项",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
        ],
      },
      {
        sectionName: "事件",
        children: [
          {
            helpText: "用户选中一个选项时触发",
            propertyName: "onOptionChange",
            label: "onOptionChange",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
          {
            helpText: "when the dropdown opens",
            propertyName: "onDropdownOpen",
            label: "onDropdownOpen",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
          {
            helpText: "when the dropdown closes",
            propertyName: "onDropdownClose",
            label: "onDropdownClose",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
        ],
      },
    ];
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      accentColor: "{{appsmith.theme.colors.primaryColor}}",
      borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
      boxShadow: "none",
    };
  }

  static getPropertyPaneStyleConfig() {
    return [
      {
        sectionName: "标签样式",
        children: [
          {
            propertyName: "labelTextColor",
            label: "字体颜色",
            helpText: "设置标签字体颜色",
            controlType: "COLOR_PICKER",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "labelTextSize",
            label: "字体大小",
            helpText: "设置标签字体大小",
            controlType: "DROP_DOWN",
            defaultValue: "0.875rem",
            hidden: isAutoLayout,
            options: [
              {
                label: "S",
                value: "0.875rem",
                subText: "0.875rem",
              },
              {
                label: "M",
                value: "1rem",
                subText: "1rem",
              },
              {
                label: "L",
                value: "1.25rem",
                subText: "1.25rem",
              },
              {
                label: "XL",
                value: "1.875rem",
                subText: "1.875rem",
              },
              {
                label: "XXL",
                value: "3rem",
                subText: "3rem",
              },
              {
                label: "3XL",
                value: "3.75rem",
                subText: "3.75rem",
              },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "labelStyle",
            label: "强调",
            helpText: "设置标签字体是否加粗或斜体",
            controlType: "BUTTON_GROUP",
            options: [
              {
                icon: "BOLD_FONT",
                value: "BOLD",
              },
              {
                icon: "ITALICS_FONT",
                value: "ITALIC",
              },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },
      {
        sectionName: "轮廓样式",
        children: [
          {
            propertyName: "accentColor",
            label: "强调色",
            controlType: "COLOR_PICKER",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            invisible: true,
          },
          {
            propertyName: "borderRadius",
            label: "边框圆角",
            helpText: "边框圆角样式",
            controlType: "BORDER_RADIUS_OPTIONS",

            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "boxShadow",
            label: "阴影",
            helpText: "组件轮廓投影",
            controlType: "BOX_SHADOW_OPTIONS",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },
    ];
  }

  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return {
      "!doc":
        "TreeSelect is used to capture user input from a specified list of permitted inputs/Nested Inputs.",
      "!url": "https://docs.appsmith.com/widget-reference/treeselect",
      isVisible: DefaultAutocompleteDefinitions.isVisible,
      selectedOptionValue: {
        "!type": "string",
        "!doc": "The value selected in a treeselect dropdown",
        "!url": "https://docs.appsmith.com/widget-reference/treeselect",
      },
      selectedOptionLabel: {
        "!type": "string",
        "!doc": "The selected option label in a treeselect dropdown",
        "!url": "https://docs.appsmith.com/widget-reference/treeselect",
      },
      isDisabled: "bool",
      isValid: "bool",
      options: "[$__dropdownOption__$]",
    };
  }

  static getDerivedPropertiesMap() {
    return {
      value: `{{this.selectedOptionValue}}`,
      flattenedOptions: `{{(()=>{${derivedProperties.getFlattenedOptions}})()}}`,
      isValid: `{{(()=>{${derivedProperties.getIsValid}})()}}`,
      selectedOptionValue: `{{(()=>{${derivedProperties.getSelectedOptionValue}})()}}`,
      selectedOptionLabel: `{{(()=>{${derivedProperties.getSelectedOptionLabel}})()}}`,
    };
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {
      selectedOption: "defaultOptionValue",
      selectedLabel: "defaultOptionValue",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      selectedOption: undefined,
      selectedLabel: undefined,
      isDirty: false,
    };
  }

  componentDidUpdate(prevProps: SingleSelectTreeWidgetProps): void {
    if (
      this.props.defaultOptionValue !== prevProps.defaultOptionValue &&
      this.props.isDirty
    ) {
      this.props.updateWidgetMetaProperty("isDirty", false);
    }
  }

  getPageView() {
    const options = isArray(this.props.options) ? this.props.options : [];
    const isInvalid =
      "isValid" in this.props && !this.props.isValid && !!this.props.isDirty;
    const dropDownWidth = MinimumPopupRows * this.props.parentColumnSpace;
    const { componentWidth } = this.getComponentDimensions();
    return (
      <SingleSelectTreeComponent
        accentColor={this.props.accentColor}
        allowClear={this.props.allowClear}
        borderRadius={this.props.borderRadius}
        boxShadow={this.props.boxShadow}
        compactMode={
          !(
            (this.props.bottomRow - this.props.topRow) /
              GRID_DENSITY_MIGRATION_V1 >
            1
          )
        }
        disabled={this.props.isDisabled ?? false}
        dropDownWidth={dropDownWidth}
        dropdownStyle={{
          zIndex: Layers.dropdownModalWidget,
        }}
        expandAll={this.props.expandAll}
        isDynamicHeightEnabled={isAutoHeightEnabledForWidget(this.props)}
        isFilterable
        isValid={!isInvalid}
        labelAlignment={this.props.labelAlignment}
        labelPosition={this.props.labelPosition}
        labelStyle={this.props.labelStyle}
        labelText={this.props.labelText}
        labelTextColor={this.props.labelTextColor}
        labelTextSize={this.props.labelTextSize}
        labelTooltip={this.props.labelTooltip}
        labelWidth={this.getLabelWidth()}
        loading={this.props.isLoading}
        onChange={this.onOptionChange}
        onDropdownClose={this.onDropdownClose}
        onDropdownOpen={this.onDropdownOpen}
        options={options}
        placeholder={this.props.placeholderText as string}
        renderMode={this.props.renderMode}
        value={this.props.selectedOptionValue}
        widgetId={this.props.widgetId}
        width={componentWidth}
      />
    );
  }

  onOptionChange = (value?: DefaultValueType, labelList?: ReactNode[]) => {
    if (!this.props.isDirty) {
      this.props.updateWidgetMetaProperty("isDirty", true);
    }

    this.props.updateWidgetMetaProperty("selectedOption", value);
    this.props.updateWidgetMetaProperty("selectedLabel", labelList?.[0] ?? "", {
      triggerPropertyName: "onOptionChange",
      dynamicString: this.props.onOptionChange,
      event: {
        type: EventType.ON_OPTION_CHANGE,
      },
    });
  };

  onDropdownOpen = () => {
    if (this.props.onDropdownOpen) {
      super.executeAction({
        triggerPropertyName: "onDropdownOpen",
        dynamicString: this.props.onDropdownOpen,
        event: {
          type: EventType.ON_DROPDOWN_OPEN,
        },
      });
    }
  };

  onDropdownClose = () => {
    if (this.props.onDropdownClose) {
      super.executeAction({
        triggerPropertyName: "onDropdownClose",
        dynamicString: this.props.onDropdownClose,
        event: {
          type: EventType.ON_DROPDOWN_CLOSE,
        },
      });
    }
  };

  static getWidgetType(): WidgetType {
    return "SINGLE_SELECT_TREE_WIDGET";
  }
}

export interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: DropdownOption[];
}

export interface SingleSelectTreeWidgetProps extends WidgetProps {
  placeholderText?: string;
  selectedIndex?: number;
  options?: DropdownOption[];
  flattenedOptions?: DropdownOption[];
  onOptionChange: string;
  onDropdownOpen?: string;
  onDropdownClose?: string;
  defaultOptionValue: string;
  isRequired: boolean;
  isLoading: boolean;
  allowClear: boolean;
  selectedLabel: string[];
  selectedOption: string | number;
  selectedOptionValue: string;
  selectedOptionLabel: string;
  expandAll: boolean;
  labelText: string;
  labelPosition?: LabelPosition;
  labelAlignment?: Alignment;
  labelWidth?: number;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  labelStyle?: string;
  borderRadius: string;
  boxShadow?: string;
  accentColor: string;
  isDirty?: boolean;
}

export default SingleSelectTreeWidget;

```

## 编辑应用

首页，编辑某个应用；

入口：**app\client\src\pages\Applications\ApplicationCard.tsx**中编辑按钮的点击事件；

路由生成、路由跳转、更新状态（发起请求）；

setURLParams()、history.push()、dispatch()

```ts
const editApp = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setURLParams();
      history.push(
        builderURL({
          pageId: props.application.defaultPageId,
          params,
        }),
      );
      dispatch(getCurrentUser());
    },
    [props.application.defaultPageId],
  );
// setURLParams()
function setURLParams() {
    const page: ApplicationPagePayload | undefined =
      props.application.pages.find(
        (page) => page.id === props.application.defaultPageId,
      );
    if (!page) return;
    urlBuilder.updateURLParams(
      {
        applicationSlug: props.application.slug,
        applicationVersion: props.application.applicationVersion,
        applicationId: props.application.id,
      },
      props.application.pages.map((page) => ({
        pageSlug: page.slug,
        customSlug: page.customSlug,
        pageId: page.id,
      })),
    );
  }
// builderURL()
export const builderURL = (props: URLBuilderParams): string => {
  return urlBuilder.build(props);
};
//getCurrentUser()
export const getCurrentUser = () => ({
  type: ReduxActionTypes.FETCH_USER_INIT,
});
```



```ts
// urlBuilder
export class URLBuilder {
  appParams: ApplicationURLParams;
  pageParams: Record<string, PageURLParams>;

  static _instance: URLBuilder;

  private constructor() {
    this.appParams = {
      applicationId: "",
      applicationSlug: PLACEHOLDER_APP_SLUG,
    };
    this.pageParams = {};
  }

  static getInstance() {
    if (URLBuilder._instance) return URLBuilder._instance;
    URLBuilder._instance = new URLBuilder();
    return URLBuilder._instance;
  }

  private getURLType(
    applicationVersion: ApplicationURLParams["applicationVersion"],
    customSlug?: string,
  ) {
    if (
      typeof applicationVersion !== "undefined" &&
      applicationVersion < ApplicationVersion.SLUG_URL
    )
      return URL_TYPE.DEFAULT;
    if (customSlug) return URL_TYPE.CUSTOM_SLUG;
    return URL_TYPE.SLUG;
  }

  private getFormattedParams(pageId: string) {
    const currentAppParams = {
      applicationSlug: this.appParams.applicationSlug || PLACEHOLDER_APP_SLUG,
      applicationId: this.appParams.applicationId,
    };
    let currentPageParams = this.pageParams[pageId] || {};
    currentPageParams = {
      ...currentPageParams,
      pageSlug: `${currentPageParams.pageSlug || PLACEHOLDER_PAGE_SLUG}-`,
      customSlug: currentPageParams.customSlug
        ? `${currentPageParams.customSlug}-`
        : "",
      pageId,
    };

    return { ...currentAppParams, ...currentPageParams };
  }

  public updateURLParams(
    appParams: ApplicationURLParams | null,
    pageParams?: PageURLParams[],
  ) {
    if (appParams) {
      this.appParams.applicationId =
        appParams.applicationId || this.appParams.applicationId;
      this.appParams.applicationSlug =
        appParams.applicationSlug || this.appParams.applicationSlug;
      this.appParams.applicationVersion =
        appParams.applicationVersion || this.appParams.applicationVersion;
    }
    if (pageParams) {
      const params = pageParams.reduce((acc, page) => {
        acc[page.pageId] = page;
        return acc;
      }, {} as Record<string, PageURLParams>);
      Object.assign(this.pageParams, params);
    }
  }

  resetURLParams() {
    this.appParams = {
      applicationId: "",
      applicationSlug: "",
    };
    this.pageParams = {};
  }

  getURLParams(pageId: string) {
    return { ...this.appParams, ...this.pageParams[pageId] };
  }

  generateBasePath(pageId: string, mode: APP_MODE) {
    const { applicationVersion } = this.appParams;

    const customSlug = this.pageParams[pageId]?.customSlug || "";

    const urlType = this.getURLType(applicationVersion, customSlug);

    const urlPattern = baseURLRegistry[urlType][mode];

    const formattedParams = this.getFormattedParams(pageId);

    const basePath = generatePath(urlPattern, formattedParams);

    return basePath;
  }

  getCustomSlugPathPreview(pageId: string, customSlug: string) {
    const urlPattern =
      baseURLRegistry[URL_TYPE.CUSTOM_SLUG][APP_MODE.PUBLISHED];
    return generatePath(urlPattern, {
      pageId,
      customSlug: `${customSlug}-`,
    }).toLowerCase();
  }

  getPagePathPreview(pageId: string, pageName: string) {
    const { applicationVersion } = this.appParams;

    const urlType = this.getURLType(applicationVersion);

    const urlPattern = baseURLRegistry[urlType][APP_MODE.PUBLISHED];

    const formattedParams = this.getFormattedParams(pageId);

    formattedParams.pageSlug = `${pageName}-`;

    return generatePath(urlPattern, formattedParams).toLowerCase();
  }

  /**
   * @throws {URIError}
   * @param builderParams
   * @param mode
   * @returns URL string
   */
  build(builderParams: URLBuilderParams, mode: APP_MODE = APP_MODE.EDIT) {
    const {
      hash = "",
      params = {},
      persistExistingParams = false,
      suffix,
      pageId,
      branch,
    } = builderParams;

    if (!pageId) {
      throw new URIError(
        "Missing pageId. If you are trying to set href inside a react component use the 'useHref' hook.",
      );
    }

    const basePath = this.generateBasePath(pageId, mode);

    const queryParamsToPersist = fetchQueryParamsToPersist(
      persistExistingParams,
    );

    const branchParams = branch ? { branch: encodeURIComponent(branch) } : {};

    const modifiedQueryParams = {
      ...queryParamsToPersist,
      ...params,
      ...branchParams,
    };

    const queryString = getQueryStringfromObject(modifiedQueryParams);

    const suffixPath = suffix ? `/${suffix}` : "";

    const hashPath = hash ? `#${hash}` : "";
    // hash fragment should be at the end of the href
    // ref: https://www.rfc-editor.org/rfc/rfc3986#section-4.1
    return `${basePath}${suffixPath}${queryString}${hashPath}`;
  }
}

const urlBuilder = URLBuilder.getInstance();
```

### 补充

1）

当拖动组件到画布后，路由从

https://dev.appsmith.com/app/1/page1-652516e186a13c01bcf052ac/edit

变成

https://dev.appsmith.com/app/1/page1-652516e186a13c01bcf052ac/edit/widgets/vqrmvpywoo

其中**vqrmvpywoo**是组件的key

2）

组件有两种视图，一种是在画布中，一种是在页面中

## 获取数据源列表（待查看）

工作区，查看所有数据源/添加数据源

入口：app\client\src\index.tsx

runSagaMiddleware()、sagaMiddleware.run(rootSaga)、rootSaga(sagasToRun)、root()

**app\client\src\store.ts**

```tsx
const sagaMiddleware = createSagaMiddleware();
const ignoredSentryActionTypes = [
  ReduxActionTypes.SET_EVALUATED_TREE,
  ReduxActionTypes.EXECUTE_PLUGIN_ACTION_SUCCESS,
  ReduxActionTypes.SET_LINT_ERRORS,
];
const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  actionTransformer: (action) => {
    if (ignoredSentryActionTypes.includes(action.type)) {
      // Return null to not log the action to Sentry
      action.payload = null;
    }
    return action;
  },
});

export default createStore(
  appReducer,
  composeWithDevTools(
    reduxBatch,
    applyMiddleware(sagaMiddleware, routeParamsMiddleware),
    reduxBatch,
    sentryReduxEnhancer,
  ),
);

export const testStore = (initialState: Partial<AppState>) =>
  createStore(
    appReducer,
    initialState,
    compose(
      reduxBatch,
      applyMiddleware(sagaMiddleware, routeParamsMiddleware),
      reduxBatch,
    ),
  );

// We don't want to run the saga middleware in tests, so exporting it from here
// And running it only when the app runs
export const runSagaMiddleware = () => sagaMiddleware.run(rootSaga);
```

**app\client\src\ee\sagas\index.tsx**

```tsx
const sagasArr = [...CE_Sagas, settingSaga];

export function* rootSaga(sagasToRun = sagasArr): any {
  // This race effect ensures that we fail as soon as the first safe crash is dispatched.
  // Without this, all the subsequent safe crash failures would be shown in the toast messages as well.
  const result = yield race({
    running: all(
      sagasToRun.map((saga) =>
        spawn(function* () {
          while (true) {
            try {
              yield call(saga);
              break;
            } catch (e) {
              log.error(e);
              sentry.captureException(e);
            }
          }
        }),
      ),
    ),
    crashed: take(ReduxActionTypes.SAFE_CRASH_APPSMITH),
  });
  if (result.crashed) yield call(rootSaga);
}
```

**app\client\src\ce\sagas\index.tsx**

```ts
export const sagas = [
  initSagas,
  pageSagas,
  watchActionSagas,
  watchJSActionSagas,
  watchActionExecutionSagas,
  watchPluginActionExecutionSagas,
  widgetOperationSagas,
  errorSagas,
  watchDatasourcesSagas,
  applicationSagas,
  apiPaneSagas,
  jsPaneSagas,
  userSagas,
  templateSagas,
  pluginSagas,
  workspaceSagas,
  importedCollectionsSagas,
  providersSagas,
  curlImportSagas,
  snipingModeSagas,
  queryPaneSagas,
  modalSagas,
  batchSagas,
  themeSagas,
  evaluationsSaga,
  onboardingSagas,
  actionExecutionChangeListeners,
  formEvaluationChangeListener,
  utilSagas,
  globalSearchSagas,
  // websocketSagas,
  debuggerSagas,
  saaSPaneSagas,
  selectionCanvasSagas,
  replaySaga,
  draggingCanvasSagas,
  gitSyncSagas,
  SuperUserSagas,
  appThemingSaga,
  NavigationSagas,
  editorContextSagas,
  PageVisibilitySaga,
  AutoHeightSagas,
  tenantSagas,
  JSLibrarySaga,
  LintingSaga,
  autoLayoutUpdateSagas,
  autoLayoutDraggingSagas,
  layoutConversionSagas,
  snapshotSagas,
  oneClickBindingSaga,
  entityNavigationSaga,
];
```

**app\client\src\sagas\PluginSagas.ts**

```ts
function* root() {
  console.log("root called");
  yield all([
    takeEvery(ReduxActionTypes.FETCH_PLUGINS_REQUEST, fetchPluginsSaga),
    takeEvery(
      ReduxActionTypes.FETCH_PLUGIN_FORM_CONFIGS_REQUEST,
      fetchPluginFormConfigsSaga,
    ),
    takeEvery(
      ReduxActionTypes.GET_PLUGIN_FORM_CONFIG_INIT,
      getPluginFormConfig,
    ),
    takeEvery(
      ReduxActionTypes.GET_DEFAULT_PLUGINS_REQUEST,
      getDefaultPluginsSaga,
    ),
  ]);
}
```

## 导入应用（待复查）

**流程：**
1.应用组菜单；
2.导入（传应用组id，打开上传json弹窗）；
3.上传json弹窗（弹窗由应用组id控制显隐）；

4.传入文件（上传完成时，关闭上传json弹窗，dispatch **importApplication**的action）；

5.触发上传文件saga（调用**ApplicationApi.importApplicationToWorkspace**，成功响应后找出当前应用组，put **importApplicationSuccess**的action，如果是isPartialImport，则put **showReconnectDatasourceModal**的action，如果不是isPartialImport，则构建路由，路由跳转到默认页面）；

6.触发**showReconnectDatasourcesModalSaga**（put getAllApplications、importApplicationSuccess、fetchPlugins、setUnconfiguredDatasourcesDuringImport、setWorkspaceIdForImport、setPageIdForImport、setIsReconnectingDatasourcesModalOpen 的action, 根据**isModalOpen**打开重连数据源弹窗）

7.触发系列saga（**getAllApplicationSaga**、**fetchPluginsSaga**），触发系列reducer（importApplicationSuccess、setUnconfiguredDatasourcesDuringImport、setWorkspaceIdForImport、setPageIdForImport、setIsReconnectingDatasourcesModalOpen ）

8.getAllApplicationSaga（调用**ApplicationApi.getAllApplication**， put FETCH_USER_APPLICATIONS_WORKSPACES_SUCCESS的action，根据isAirgappedInstance状态call fetchReleases）

9.fetchPluginsSaga（调用**PluginsApi.fetchPlugins**，put FETCH_PLUGINS_SUCCESS的action）

10.重连数据源弹窗打开，填写数据源信息后点击保存（dispatch toggleSaveActionFromPopupFlag的action）

```tsx
// 导入
{enableImportExport &&
    hasCreateNewApplicationPermission && (
    <MenuItem
        data-testid="t--workspace-import-app"
        onSelect={() =>
        setSelectedWorkspaceIdForImportApplication(
            workspace.id,
        )}
        startIcon="download"
        >
        导入
    </MenuItem>
)}
```

```tsx
// 上传json弹窗
{selectedWorkspaceIdForImportApplication && (
    <ImportApplicationModal
        isModalOpen={
            selectedWorkspaceIdForImportApplication === workspace.id
        }
        onClose={() => setSelectedWorkspaceIdForImportApplication("")}
        workspaceId={selectedWorkspaceIdForImportApplication}
        />
)}
```

```tsx
// 传入文件
const FileUploader = useCallback(
    async (file: File, setProgress: SetProgress) => {
        if (!!file) {
            setAppFileToBeUploaded({
                file,
                setProgress,
            });
            dispatch(
                importApplication({
                    appId: appId as string,
                    workspaceId: workspaceId as string,
                    applicationFile: file,
                }),
            );
        } else {
            setAppFileToBeUploaded(null);
        }
    },
    [],
);
useEffect(() => {
    // finished of importing application
    if (appFileToBeUploaded && !importingApplication) {
        setAppFileToBeUploaded(null);
        onClose && onClose();
        // should open "Add credential" modal
    }
}, [appFileToBeUploaded, importingApplication]);



{!importingApplication && (
    <Row>
        <FileImportCard
            className="t--import-json-card"
            fillCardWidth={toApp}
            >
            <FilePickerV2
                containerClickable
                description={createMessage(IMPORT_APP_FROM_FILE_MESSAGE)}
                fileType={FileType.JSON}
                fileUploader={FileUploader}
                iconFillColor={"var(--ads-v2-color-fg)"}
                onFileRemoved={onRemoveFile}
                title={createMessage(IMPORT_APP_FROM_FILE_TITLE)}
                uploadIcon="file-line"
                />
        </FileImportCard>
        {!toApp && <GitImportCard handler={onGitImport} />}
    </Row>
)}
```

```tsx
// 触发上传文件saga
export function* importApplicationSaga(
action: ReduxAction<ImportApplicationRequest>,
) {
    try {
        const response: ApiResponse = yield call(
            ApplicationApi.importApplicationToWorkspace,
            action.payload,
        );
        const isValidResponse: boolean = yield validateResponse(response);
        if (isValidResponse) {
            const allWorkspaces: Workspace[] = yield select(getCurrentWorkspace);
            const currentWorkspace = allWorkspaces.filter(
                (el: Workspace) => el.id === action.payload.workspaceId,
            );
            if (currentWorkspace.length > 0) {
                const {
                    // @ts-expect-error: response is of type unknown
                    application: { pages },
                    // @ts-expect-error: response is of type unknown
                    isPartialImport,
                } = response.data;

                // @ts-expect-error: response is of type unknown
                yield put(importApplicationSuccess(response.data?.application));

                if (isPartialImport) {
                    yield put(
                        showReconnectDatasourceModal({
                            // @ts-expect-error: response is of type unknown
                            application: response.data?.application,
                            unConfiguredDatasourceList:
                            // @ts-expect-error: response is of type unknown
                            response?.data.unConfiguredDatasourceList,
                            workspaceId: action.payload.workspaceId,
                        }),
                    );
                } else {
                    // @ts-expect-error: pages is of type any
                    // TODO: Update route params here
                    const defaultPage = pages.filter((eachPage) => !!eachPage.isDefault);
                    const pageURL = builderURL({
                        pageId: defaultPage[0].id,
                    });
                    history.push(pageURL);
                    const guidedTour: boolean = yield select(inGuidedTour);

                    if (guidedTour) return;

                    toast.show("应用导入成功！", {
                        kind: "success",
                    });
                }
            }
        }
    } catch (error) {
        yield put({
            type: ReduxActionErrorTypes.IMPORT_APPLICATION_ERROR,
            payload: {
                error,
            },
        });
    }
}

export default function* applicationSagas() {
  yield all([
    ...
    takeLatest(ReduxActionTypes.IMPORT_APPLICATION_INIT, importApplicationSaga),
    ...
  ]);
}

```

```tsx
// 触发显示重连数据源弹窗saga
export function* showReconnectDatasourcesModalSaga(
action: ReduxAction<{
    application: ApplicationResponsePayload;
    unConfiguredDatasourceList: Array<Datasource>;
    workspaceId: string;
    pageId?: string;
}>,
) {
    const { application, pageId, unConfiguredDatasourceList, workspaceId } =
          action.payload;
    yield put(getAllApplications());
    yield put(importApplicationSuccess(application));
    yield put(fetchPlugins({ workspaceId }));

    yield put(
        setUnconfiguredDatasourcesDuringImport(unConfiguredDatasourceList || []),
    );

    yield put(setWorkspaceIdForImport(workspaceId));
    yield put(setPageIdForImport(pageId));
    yield put(setIsReconnectingDatasourcesModalOpen({ isOpen: true }));
}

export default function* applicationSagas() {
  yield all([
    ...
    takeLatest(
      ReduxActionTypes.SHOW_RECONNECT_DATASOURCE_MODAL,
      showReconnectDatasourcesModalSaga,
    ),
    ...
  ]);
}

```

```tsx
// 触发系列saga
export function* getAllApplicationSaga() {
  const isAirgappedInstance = isAirgapped();
  try {
    const response: FetchUsersApplicationsWorkspacesResponse = yield call(
      ApplicationApi.getAllApplication,
    );
    const isValidResponse: boolean = yield validateResponse(response);
    if (isValidResponse) {
      const workspaceApplication: WorkspaceApplicationObject[] =
        response.data.workspaceApplications.map(
          (userWorkspaces: WorkspaceApplicationObject) => ({
            workspace: userWorkspaces.workspace,
            users: userWorkspaces.users,
            applications: !userWorkspaces.applications
              ? []
              : userWorkspaces.applications.map(
                  (application: ApplicationObject) => {
                    return {
                      ...application,
                      defaultPageId: getDefaultPageId(application.pages),
                    };
                  },
                ),
          }),
        );

      yield put({
        type: ReduxActionTypes.FETCH_USER_APPLICATIONS_WORKSPACES_SUCCESS,
        payload: workspaceApplication,
      });
    }
    if (!isAirgappedInstance) {
      yield call(fetchReleases);
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.FETCH_USER_APPLICATIONS_WORKSPACES_ERROR,
      payload: {
        error,
      },
    });
  }
}
```

```tsx
// getAllApplicationSaga
export function* getAllApplicationSaga() {
  const isAirgappedInstance = isAirgapped();
  try {
    const response: FetchUsersApplicationsWorkspacesResponse = yield call(
      ApplicationApi.getAllApplication,
    );
    const isValidResponse: boolean = yield validateResponse(response);
    if (isValidResponse) {
      const workspaceApplication: WorkspaceApplicationObject[] =
        response.data.workspaceApplications.map(
          (userWorkspaces: WorkspaceApplicationObject) => ({
            workspace: userWorkspaces.workspace,
            users: userWorkspaces.users,
            applications: !userWorkspaces.applications
              ? []
              : userWorkspaces.applications.map(
                  (application: ApplicationObject) => {
                    return {
                      ...application,
                      defaultPageId: getDefaultPageId(application.pages),
                    };
                  },
                ),
          }),
        );

      yield put({
        type: ReduxActionTypes.FETCH_USER_APPLICATIONS_WORKSPACES_SUCCESS,
        payload: workspaceApplication,
      });
    }
    if (!isAirgappedInstance) {
      yield call(fetchReleases);
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.FETCH_USER_APPLICATIONS_WORKSPACES_ERROR,
      payload: {
        error,
      },
    });
  }
}
```

```tsx
// fetchPluginsSaga
function* fetchPluginsSaga(
  action: ReduxAction<{ workspaceId?: string } | undefined>,
) {
  try {
    let workspaceId: string = yield select(getCurrentWorkspaceId);
    if (action.payload?.workspaceId) workspaceId = action.payload?.workspaceId;

    if (!workspaceId) {
      throw Error("Workspace id does not exist");
    }
    const pluginsResponse: ApiResponse<Plugin[]> = yield call(
      PluginsApi.fetchPlugins,
      workspaceId,
    );
    const isValid: boolean = yield validateResponse(pluginsResponse);
    if (isValid) {
      yield put({
        type: ReduxActionTypes.FETCH_PLUGINS_SUCCESS,
        payload: pluginsResponse.data,
      });
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.FETCH_PLUGINS_ERROR,
      payload: { error },
    });
  }
}
```

```tsx
// 重连数据源弹窗打开，填写数据源信息后点击保存
<div className="db-form-content-container">
    {this.renderForm()}
</div>

renderForm() {
    const {
        datasource,
        datasourceId,
        formConfig,
        formData,
        formName,
        isFormDirty,
        isInsideReconnectModal,
        isSaving,
        location,
        pageId,
        pluginDatasourceForm,
        pluginName,
        pluginPackageName,
        pluginType,
        viewMode,
    } = this.props;
    console.log("123", 123);
    console.log("formData", formData);

    const shouldViewMode = viewMode && !isInsideReconnectModal;
    // Check for specific form types first
    if (
        pluginDatasourceForm === DatasourceComponentTypes.RestAPIDatasourceForm &&
        !shouldViewMode
    ) {
        return (
            <>
            <RestAPIDatasourceForm
                applicationId={this.props.applicationId}
                currentEnvironment={this.state.filterParams.id}
                datasource={datasource}
                datasourceId={datasourceId}
                formData={formData}
                formName={formName}
                hiddenHeader={isInsideReconnectModal}
                isFormDirty={isFormDirty}
                isSaving={isSaving}
                location={location}
                pageId={pageId}
                pluginName={pluginName}
                pluginPackageName={pluginPackageName}
                showFilterComponent={this.state.filterParams.showFilterPane}
                />
            {this.renderSaveDisacardModal()}
    </>
    );
}

// Default to DB Editor Form
return (
    <>
    <DataSourceEditorForm
        applicationId={this.props.applicationId}
        currentEnvironment={this.getEnvironmentId()}
        datasourceId={datasourceId}
        formConfig={formConfig}
        formData={formData}
        formName={DATASOURCE_DB_FORM}
        hiddenHeader={isInsideReconnectModal}
        isSaving={isSaving}
        pageId={pageId}
        pluginType={pluginType}
        setupConfig={this.setupConfig}
        showFilterComponent={this.state.filterParams.showFilterPane}
        viewMode={viewMode && !isInsideReconnectModal}
        />
    {this.renderSaveDisacardModal()}
    </>
);
}

renderSaveDisacardModal() {
    return (
        <SaveOrDiscardDatasourceModal
            datasourceId={this.props.datasourceId}
            datasourcePermissions={this.props.datasource?.userPermissions || []}
            isOpen={this.state.showDialog}
            onClose={this.closeDialog}
            onDiscard={this.onDiscard}
            onSave={this.onSave}
            saveButtonText={createMessage(SAVE_BUTTON_TEXT)}
            />
    );
}

onSave() {
    this.props.toggleSaveActionFromPopupFlag(true);
}



const mapDispatchToProps = (
    dispatch: any,
    ownProps: any,
): DatasourcePaneFunctions => ({
    ...
    toggleSaveActionFromPopupFlag: (flag) =>
    dispatch(toggleSaveActionFromPopupFlag(flag)),
    ...
});
export default connect(
    mapStateToProps,
    mapDispatchToProps,
    )(DatasourceEditorRouter);
```



## 身份认证配置（待继续）

1.首页-管理员设置；

2.**Categories**组件渲染所有配置菜单（点击对应菜单，**adminSettingsCategoryUrl**根据每项的slug动态构建路由，然后进行跳转）；

3.**Main**组件根据subCategory或category渲染右侧内容（如果wrapperCategory中组件有值，则渲染该组件**AuthMain**，）；

4.渲染**AdminConfig**的内容（不同的菜单项有不同的配置）；

5.**authentication**菜单的配置；

6.**AuthPage**组件根据不同authMethods渲染不同鉴权方式入口；

7.点击入口（入口按钮文本根据 isConnected 和 isFeatureEnabled 切换, **adminSettingsCategoryUrl**根据category动态构建路由并进行跳转，此时路由发生变化，）；

8.详细的配置信息修改；

9.保存；

### 2

```tsx
// Categories组件渲染所有配置菜单
<CategoryList className="t--settings-category-list">
    {categories?.map((config) => {
        const active =
              !!currentSubCategory && showSubCategory
        ? currentSubCategory == config.slug
        : currentCategory == config.slug;
        return (
            <CategoryItem key={config.slug}>
                <StyledLink
                    $active={active}
                    className={`t--settings-category-${config.slug} ${
                    active ? "active" : ""
                              }`}
                    onClick={() =>
            onClickHandler(config.slug, config?.needsUpgrade || false)
                            }
                    to={
                        !parentCategory
                            ? adminSettingsCategoryUrl({ category: config.slug })
                        : adminSettingsCategoryUrl({
                            category: parentCategory.slug,
                            selected: config.slug,
                        })
                    }
                    >
                    {config?.needsUpgrade ? (
                        <Icon name="lock-2-line" />
                    ) : (
                        config?.icon && <Icon name={config?.icon} size="md" />
                    )}
                    <SettingName active={active}>{config.title}</SettingName>
                    {config?.needsUpgrade &&
                        (config?.isEnterprise ? <EnterpriseTag /> : <BusinessTag />)}
                </StyledLink>
                {showSubCategory && (
                    <Categories
                        categories={config.children}
                        currentCategory={currentCategory}
                        currentSubCategory={currentSubCategory}
                        parentCategory={config}
                        />
                )}
            </CategoryItem>
        );
    })}
</CategoryList>
```

```ts
export function adminSettingsCategoryUrl({
  category,
  selected,
}: {
  category: string;
  selected?: string;
}) {
  return `${ADMIN_SETTINGS_PATH}/${category}${selected ? "/" + selected : ""}`;
}
```

### 3

```tsx
// Main组件根据subCategory或category渲染右侧内容；
const Main = () => {
  const params = useParams() as any;
  const { category, selected: subCategory } = params;
  const user = useSelector(getCurrentUser);
  const tenantPermissions = useSelector(getTenantPermissions);
  const isSuperUser = user?.isSuperUser || false;
  const wrapperCategory =
    AdminConfig.wrapperCategories[subCategory ?? category];

  if (!!wrapperCategory?.component) {
    const { component: WrapperCategoryComponent } = wrapperCategory;
    return <WrapperCategoryComponent category={wrapperCategory} />;
  } else if (
    !Object.values(SettingCategories).includes(category) ||
    (subCategory && !Object.values(SettingCategories).includes(subCategory))
  ) {
    return (
      <Redirect
        to={getDefaultAdminSettingsPath({ isSuperUser, tenantPermissions })}
      />
    );
  } else {
    return <SettingsForm />;
  }
};
```

### 4

```tsx
// 渲染AdminConfig的内容
import { ConfigFactory } from "pages/Settings/config/ConfigFactory";

import { config as GeneralConfig } from "@appsmith/pages/AdminSettings/config/general";
import { config as EmailConfig } from "pages/Settings/config/email";
import { config as MiniConfig } from "pages/Settings/config/mini";
import { config as MapsConfig } from "pages/Settings/config/googleMaps";
import { config as BaiduMapsConfig } from "pages/Settings/config/baiduMaps";
import { config as VersionConfig } from "pages/Settings/config/version";
import { config as AdvancedConfig } from "pages/Settings/config/advanced";
import { config as Authentication } from "@appsmith/pages/AdminSettings/config/authentication";
import { config as BrandingConfig } from "@appsmith/pages/AdminSettings/config/branding";
import { config as ProvisioningConfig } from "@appsmith/pages/AdminSettings/config/provisioning";
import { config as UserListing } from "@appsmith/pages/AdminSettings/config//userlisting";
import { config as AuditLogsConfig } from "@appsmith/pages/AdminSettings/config/auditLogsConfig";

ConfigFactory.register(GeneralConfig);
ConfigFactory.register(EmailConfig);
ConfigFactory.register(MiniConfig);
ConfigFactory.register(MapsConfig);
ConfigFactory.register(BaiduMapsConfig);
ConfigFactory.register(Authentication);
ConfigFactory.register(AdvancedConfig);
ConfigFactory.register(VersionConfig);
ConfigFactory.register(BrandingConfig);
ConfigFactory.register(ProvisioningConfig);
ConfigFactory.register(UserListing);
ConfigFactory.register(AuditLogsConfig);

export default ConfigFactory;
```

### 5

```tsx
// authentication菜单的配置
import React from "react";
import {
  GITHUB_SIGNUP_SETUP_DOC,
  GOOGLE_SIGNUP_SETUP_DOC,
  SIGNUP_RESTRICTION_DOC,
  WX_SIGNUP_SETUP_DOC,
} from "constants/ThirdPartyConstants";
import type { AdminConfigType } from "@appsmith/pages/AdminSettings/config/types";
import {
  CategoryType,
  SettingCategories,
  SettingSubCategories,
  SettingSubtype,
  SettingTypes,
} from "@appsmith/pages/AdminSettings/config/types";
import type { AuthMethodType } from "./AuthPage";
import { AuthPage } from "./AuthPage";
import Google from "assets/images/Google.png";
import SamlSso from "assets/images/saml.svg";
import OIDC from "assets/images/oidc.svg";
import Github from "assets/images/Github.png";
import Lock from "assets/images/lock-password-line.svg";
import { useSelector } from "react-redux";
import {
  getThirdPartyAuths,
  getIsFormLoginEnabled,
} from "@appsmith/selectors/tenantSelectors";
import {
  FORM_LOGIN_DESC,
  GITHUB_AUTH_DESC,
  GOOGLE_AUTH_DESC,
  OIDC_AUTH_DESC,
  SAML_AUTH_DESC,
  createMessage,
} from "@appsmith/constants/messages";
import { isSAMLEnabled, isOIDCEnabled } from "@appsmith/utils/planHelpers";
import { selectFeatureFlags } from "@appsmith/selectors/featureFlagsSelectors";
import store from "store";
import WeChat from "assets/images/WeChat.svg";
import { getAppsmithConfigs } from "@appsmith/configs";
import { getWXLoginClientId } from "ce/selectors/settingsSelectors";

const { enableWeChatOAuth } = getAppsmithConfigs();
const featureFlags = selectFeatureFlags(store.getState());

const FormAuth: AdminConfigType = {
  type: SettingCategories.FORM_AUTH,
  categoryType: CategoryType.GENERAL,
  controlType: SettingTypes.GROUP,
  title: "账号密码登录",
  subText: createMessage(FORM_LOGIN_DESC),
  canSave: true,
  isConnected: false,
  settings: [
    {
      id: "APPSMITH_FORM_LOGIN_DISABLED",
      category: SettingCategories.FORM_AUTH,
      controlType: SettingTypes.TOGGLE,
      label: "登录",
      toggleText: (value: boolean) => (value ? "关闭" : "开启"),
    },
    {
      id: "APPSMITH_SIGNUP_DISABLED",
      category: SettingCategories.FORM_AUTH,
      controlType: SettingTypes.TOGGLE,
      label: "注册",
      toggleText: (value: boolean) =>
        value ? "只允许邀请用户注册" : "允许任何用户注册",
    },
    {
      id: "APPSMITH_FORM_CALLOUT_BANNER",
      category: SettingCategories.FORM_AUTH,
      controlType: SettingTypes.LINK,
      label: "账号密码登录不会校验邮箱是否有效",
      url: SIGNUP_RESTRICTION_DOC,
      calloutType: "warning",
    },
  ],
};

const GoogleAuth: AdminConfigType = {
  type: SettingCategories.GOOGLE_AUTH,
  categoryType: CategoryType.GENERAL,
  controlType: SettingTypes.GROUP,
  title: "Google 登录",
  subText: createMessage(GOOGLE_AUTH_DESC),
  canSave: true,
  settings: [
    {
      id: "APPSMITH_OAUTH2_GOOGLE_READ_MORE",
      category: SettingCategories.GOOGLE_AUTH,
      controlType: SettingTypes.LINK,
      label: "如何配置？",
      url: GOOGLE_SIGNUP_SETUP_DOC,
    },
    {
      id: "APPSMITH_OAUTH2_GOOGLE_JS_ORIGIN_URL",
      category: SettingCategories.GOOGLE_AUTH,
      controlType: SettingTypes.UNEDITABLEFIELD,
      label: "JavaScript origin URL",
      fieldName: "js-origin-url-form",
      value: "",
      tooltip:
        "This URL will be used while configuring the Google OAuth Client ID's authorized JavaScript origins",
      helpText: "Paste this URL in your Google developer console.",
    },
    {
      id: "APPSMITH_OAUTH2_GOOGLE_REDIRECT_URL",
      category: SettingCategories.GOOGLE_AUTH,
      controlType: SettingTypes.UNEDITABLEFIELD,
      label: "Redirect URL",
      fieldName: "redirect-url-form",
      value: "/login/oauth2/code/google",
      tooltip:
        "This URL will be used while configuring the Google OAuth Client ID's authorized redirect URIs",
      helpText: "Paste this URL in your Google developer console.",
    },
    {
      id: "APPSMITH_OAUTH2_GOOGLE_CLIENT_ID",
      category: SettingCategories.GOOGLE_AUTH,
      controlType: SettingTypes.TEXTINPUT,
      controlSubType: SettingSubtype.TEXT,
      label: "Client ID",
      isRequired: true,
    },
    {
      id: "APPSMITH_OAUTH2_GOOGLE_CLIENT_SECRET",
      category: SettingCategories.GOOGLE_AUTH,
      controlType: SettingTypes.TEXTINPUT,
      controlSubType: SettingSubtype.TEXT,
      label: "Client secret",
      isRequired: true,
    },
    {
      id: "APPSMITH_SIGNUP_ALLOWED_DOMAINS",
      category: SettingCategories.GOOGLE_AUTH,
      controlType: SettingTypes.TEXTINPUT,
      controlSubType: SettingSubtype.TEXT,
      label: "允许域名",
      placeholder: "domain1.com, domain2.com",
    },
  ],
};

const GithubAuth: AdminConfigType = {
  type: SettingCategories.GITHUB_AUTH,
  categoryType: CategoryType.GENERAL,
  controlType: SettingTypes.GROUP,
  title: "Github 登录",
  subText: createMessage(GITHUB_AUTH_DESC),
  canSave: true,
  settings: [
    {
      id: "APPSMITH_OAUTH2_GITHUB_READ_MORE",
      category: SettingCategories.GITHUB_AUTH,
      controlType: SettingTypes.LINK,
      label: "如何配置？",
      url: GITHUB_SIGNUP_SETUP_DOC,
    },
    {
      id: "APPSMITH_OAUTH2_GITHUB_HOMEPAGE_URL",
      category: SettingCategories.GITHUB_AUTH,
      controlType: SettingTypes.UNEDITABLEFIELD,
      label: "Homepage URL",
      fieldName: "homepage-url-form",
      value: "",
      tooltip:
        "This URL will be used while configuring the GitHub OAuth Client ID's homepage URL",
      helpText: "Paste this URL in your GitHub developer settings.",
    },
    {
      id: "APPSMITH_OAUTH2_GITHUB_REDIRECT_URL",
      category: SettingCategories.GITHUB_AUTH,
      controlType: SettingTypes.UNEDITABLEFIELD,
      label: "Redirect URL",
      fieldName: "callback-url-form",
      value: "/login/oauth2/code/github",
      tooltip:
        "This URL will be used while configuring the GitHub OAuth Client ID's Authorization callback URL",
      helpText: "Paste this URL in your GitHub developer settings.",
    },
    {
      id: "APPSMITH_OAUTH2_GITHUB_CLIENT_ID",
      category: SettingCategories.GITHUB_AUTH,
      controlType: SettingTypes.TEXTINPUT,
      controlSubType: SettingSubtype.TEXT,
      label: "Client ID",
      isRequired: true,
    },
    {
      id: "APPSMITH_OAUTH2_GITHUB_CLIENT_SECRET",
      category: SettingCategories.GITHUB_AUTH,
      controlType: SettingTypes.TEXTINPUT,
      controlSubType: SettingSubtype.TEXT,
      label: "Client secret",
      isRequired: true,
    },
  ],
};

const WeChatAuth: AdminConfigType = {
  type: SettingCategories.WECHAT_AUTH,
  controlType: SettingTypes.GROUP,
  title: "微信登录",
  subText: "让你可以微信账号进行登录",
  canSave: true,
  isConnected: enableWeChatOAuth,
  categoryType: CategoryType.OTHER,
  settings: [
    {
      id: "APPSMITH_OAUTH2_OIDC_READ_MORE",
      category: SettingCategories.WECHAT_AUTH,
      subCategory: SettingSubCategories.WECHAT,
      controlType: SettingTypes.LINK,
      label: "如何配置？",
      url: WX_SIGNUP_SETUP_DOC,
    },
    {
      id: "APPSMITH_WX_CLIENT_REDIRECT_URL",
      category: SettingCategories.WECHAT_AUTH,
      subCategory: SettingSubCategories.WECHAT,
      controlType: SettingTypes.UNEDITABLEFIELD,
      label: "Redirect URL",
      fieldName: "oidc-redirect-url",
      formName: "OidcRedirectUrl",
      value: "/api/v1/wxLogin/callback",
      helpText: "拷贝到你的认证服务器配置中",
      forceHidden: true,
    },
    {
      id: "APPSMITH_WX_CLIENT_ID",
      category: SettingCategories.WECHAT_AUTH,
      subCategory: SettingSubCategories.WECHAT,
      controlType: SettingTypes.TEXTINPUT,
      controlSubType: SettingSubtype.TEXT,
      label: "Client ID",
      isRequired: true,
    },
    {
      id: "APPSMITH_WX_CLIENT_SECRET",
      category: SettingCategories.WECHAT_AUTH,
      subCategory: SettingSubCategories.WECHAT,
      controlType: SettingTypes.TEXTINPUT,
      controlSubType: SettingSubtype.TEXT,
      label: "Client Secret",
      isRequired: true,
    },
  ],
};

export const FormAuthCallout: AuthMethodType = {
  id: "APPSMITH_FORM_LOGIN_AUTH",
  category: SettingCategories.FORM_AUTH,
  label: "账号密码登录",
  subText: createMessage(FORM_LOGIN_DESC),
  image: Lock,
  icon: "lock-password-line",
  isFeatureEnabled: true,
};

export const GoogleAuthCallout: AuthMethodType = {
  id: "APPSMITH_GOOGLE_AUTH",
  category: SettingCategories.GOOGLE_AUTH,
  label: "Google",
  subText: createMessage(GOOGLE_AUTH_DESC),
  image: Google,
  isFeatureEnabled: true,
};

export const GithubAuthCallout: AuthMethodType = {
  id: "APPSMITH_GITHUB_AUTH",
  category: SettingCategories.GITHUB_AUTH,
  label: "Github",
  subText: createMessage(GITHUB_AUTH_DESC),
  image: Github,
  isFeatureEnabled: true,
};

export const SamlAuthCallout: AuthMethodType = {
  id: "APPSMITH_SAML_AUTH",
  category: SettingCategories.SAML_AUTH,
  label: "SAML 2.0",
  subText: createMessage(SAML_AUTH_DESC),
  image: SamlSso,
  isFeatureEnabled: isSAMLEnabled(featureFlags),
};

export const OidcAuthCallout: AuthMethodType = {
  id: "APPSMITH_OIDC_AUTH",
  category: SettingCategories.OIDC_AUTH,
  label: "OIDC",
  subText: createMessage(OIDC_AUTH_DESC),
  image: OIDC,
  isFeatureEnabled: isOIDCEnabled(featureFlags),
};

const WeChatCallout: AuthMethodType = {
  id: "APPSMITH_WECHAT_AUTH",
  category: SettingCategories.WECHAT_AUTH,
  label: "微信",
  subText: `允许使用 微信账号登录你的平台`,
  image: WeChat,
  isConnected: enableWeChatOAuth,
  needsUpgrade: false,
  isFeatureEnabled: true,
};

const AuthMethods = [
  // OidcAuthCallout,
  // SamlAuthCallout,
  GoogleAuthCallout,
  GithubAuthCallout,
  FormAuthCallout,
  WeChatCallout,
];

function AuthMain() {
  const WXLoginClientId = useSelector(getWXLoginClientId);
  FormAuthCallout.isConnected = useSelector(getIsFormLoginEnabled);
  const socialLoginList = useSelector(getThirdPartyAuths);
  WeChatAuth.isConnected = WeChatCallout.isConnected =
    socialLoginList.includes("wechat") || !!WXLoginClientId;
  GoogleAuth.isConnected = GoogleAuthCallout.isConnected =
    socialLoginList.includes("google");
  GithubAuth.isConnected = GithubAuthCallout.isConnected =
    socialLoginList.includes("github");
  return <AuthPage authMethods={AuthMethods} />;
}

export const config: AdminConfigType = {
  icon: "lock-password-line",
  type: SettingCategories.AUTHENTICATION,
  categoryType: CategoryType.GENERAL,
  controlType: SettingTypes.PAGE,
  title: "身份认证",
  canSave: false,
  children: [FormAuth, GoogleAuth, GithubAuth, WeChatAuth],
  component: AuthMain,
};

```

### 6

```tsx
// AuthPage组件根据不同authMethods渲染不同鉴权方式入口
{authMethods &&
    authMethods.map((method) => {
    return (
        <div key={method.id}>
            <MethodCard>
                {method.icon ? (
                    <Icon name={method.icon} size="lg" />
                ) : (
                    <Image alt={method.label} src={method.image} />
                )}
                <MethodDetailsWrapper>
                    <MethodTitle
                        color="var(--ads-v2-color-fg)"
                        kind="heading-s"
                        renderAs="p"
                        >
                        {method.label}&nbsp;
                        {!method.isFeatureEnabled && <BusinessTag />}
                        {method.isConnected && (
                            <Tooltip
                                content={createMessage(
                                    AUTHENTICATION_METHOD_ENABLED,
                                    method.label,
                                )}
                                placement="right"
                                >
                                <Icon
                                    className={`${method.category}-green-check`}
                                    color="var(--ads-v2-color-fg-success)"
                                    name="oval-check-fill"
                                    />
                            </Tooltip>
                        )}
                    </MethodTitle>
                    <MethodDets
                        color="var(--ads-v2-color-fg)"
                        kind="body-s"
                        renderAs="p"
                        >
                        {method.subText}
                    </MethodDets>
                    {method.calloutBanner && (
                        <Callout
                            kind="info"
                            links={[
                                {
                                    children: method.calloutBanner.actionLabel,
                                    to: "",
                                },
                            ]}
                            >
                            {method.calloutBanner.title}
                        </Callout>
                    )}
                </MethodDetailsWrapper>
                <ActionButton method={method} />
            </MethodCard>
            <Divider />
        </div>
    );
})}
```

### 7

```tsx
// 点击入口
export function ActionButton({ method }: { method: AuthMethodType }) {
  const history = useHistory();
  const { onUpgrade } = useOnUpgrade({
    logEventName: "ADMIN_SETTINGS_UPGRADE_AUTH_METHOD",
    logEventData: { method: method.label },
  });

  const onClickHandler = (method: AuthMethodType) => {
    if (method?.isFeatureEnabled || method.isConnected) {
      AnalyticsUtil.logEvent(
        method.isConnected
          ? "ADMIN_SETTINGS_EDIT_AUTH_METHOD"
          : "ADMIN_SETTINGS_ENABLE_AUTH_METHOD",
        {
          method: method.label,
        },
      );
      history.push(
        adminSettingsCategoryUrl({
          category: SettingCategories.AUTHENTICATION,
          selected: method.category,
        }),
      );
    } else {
      onUpgrade();
    }
  };

  return (
    <ButtonWrapper>
      <Button
        className={`t--settings-sub-category-${
          !method?.isFeatureEnabled
            ? `upgrade-${method.category}`
            : method.category
        }`}
        data-testid="btn-auth-account"
        kind={"secondary"}
        onClick={() => onClickHandler(method)}
        size="md"
      >
        {createMessage(
          method.isConnected
            ? EDIT
            : !method?.isFeatureEnabled
            ? UPGRADE
            : ENABLE,
        )}
      </Button>
    </ButtonWrapper>
  );
}
```



## 创建应用

## 如何获取其他组件的属性的？

>  1.组件获得属性

WidgetRegistry.tsx

```ts
for (const widget of ALL_WIDGETS_AND_CONFIG) {
    registerWidget(widget[0], widget[1] as WidgetConfiguration);
}
```

调用registerWidget，传入初始配置，使widget获得属性；

> generateWidget: memoize、getWidgetComponent、withMeta、withLazyRender、Sentry.withProfiler
> 2.1 返回一个经过处理的 `widget`。这个 `widget` 包含了元数据、懒加载渲染、性能分析等处理
>
> registerWidgetBuilder：enhancePropertyPaneConfig、convertFunctionsToString、addPropertyConfigIds、addSearchConfigToPanelConfig、generatePropertyPaneSearchConfig
> 2.2 处理配置信息，并保存在WidgetFactory对应的映射表中
>
> configureWidget：generateReactKey、storeNonSerialisablewidgetConfig、storeWidgetConfig、setWidgetMethods
> 2.3 对`widget`进行配置，并将其相关信息注册到 `WidgetFactory` 中，以及通过 Redux 更新应用程序状态。

WidgetRegisterHelpers.tsx

```ts
export const registerWidget = (
  Widget: typeof BaseWidget,
  config: WidgetConfiguration,
) => {
  const ProfiledWidget = generateWidget(
    Widget,
    !!config.needsMeta,
    !!config.eagerRender,
  );

  WidgetFactory.registerWidgetBuilder(
    config.type,
    {
      buildWidget(widgetData: any): JSX.Element {
        return <ProfiledWidget {...widgetData} key={widgetData.widgetId} />;
      },
    },
    config.properties.derived,
    config.properties.default,
    config.properties.meta,
    config.properties.config,
    config.properties.contentConfig,
    config.properties.styleConfig,
    config.features,
    config.properties.loadingProperties,
    config.properties.stylesheetConfig,
    config.properties.autocompleteDefinitions,
    config.autoLayout,
    config.properties.setterConfig,
  );

  configureWidget(config);
};
```

## 日志&错误追踪&性能监控

### 日志

- 为什么要使用日志
- 日志使用场景
- 如何实现日志
- 项目中如何使用

> 为什么要使用日志

日志系统可以帮助开发者追踪和理解用户的行为，以及在出现问题时进行调试;

例如，如果一个用户报告了一个错误，但是没有提供足够的信息来复现这个问题，那么日志就可以提供更多的上下文信息来帮助开发者找到问题的原因;

此外，日志还可以用于性能分析，帮助开发者找到可能的性能瓶颈;

> 使用场景

1. **错误和异常**：当应用中发生错误或异常时，应该记录日志。这包括**系统错误**、**业务逻辑错误**、**API调用错误**等。这些日志可以帮助开发者找到问题的原因。
2. **重要的业务逻辑**：对于一些重要的业务逻辑，如**用户登录、支付、订单处理**等，应该记录日志。这些日志可以帮助开发者理解业务的运行情况，以及在出现问题时进行调试。
3. **用户行为**：记录用户的行为，如**点击、浏览、搜索**等，可以帮助开发者理解用户的**需求和习惯**，以便优化产品。
4. **性能问题**：如果应用的某个部分**可能存在性能**问题，可以通过记录日志来监控其性能。

> 如何实现日志

1. 选择一个日志库（loglevel、winston）
2. 初始化日志库（项目入口）
3. 使用（需要记录的地方）
4. 处理日志（传服务器或存本地）

> 方案选择

loglevel：轻量级（约1kb）、使用简单（api使用简单）、无依赖、跨平台、社区支持；

winston：功能相对丰富，更适合node后端项目；

> 项目中怎么使用的

在项目入口使用自定义组件AppErrorBoundary包裹根组件；

AppErrorBoundary的componentDidCatch生命周期中使用日志（componentDidCatch会在子组件树任何地方发生错误被调用）；

这样，当项目中的组件发生错误，会在componentDidCatch中获取到错误信息和位置；

注意，`componentDidCatch`只能捕获在渲染过程中、生命周期方法中、以及构造函数中发生的错误。对于事件处理器中的错误，你需要使用try/catch语句来捕获。

AppErrorBoundary组件：

```jsx
import React, { Component } from "react";
import styled from "styled-components";
import AppCrashImage from "assets/images/404-image.png";
import * as Sentry from "@sentry/react";
import log from "loglevel";
import AnalyticsUtil from "utils/AnalyticsUtil";
import { Button } from "design-system";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: calc(100vh - ${(props) => props.theme.headerHeight});
  .bold-text {
    font-weight: ${(props) => props.theme.fontWeights[3]};
    font-size: 24px;
  }
  .page-unavailable-img {
    width: 35%;
  }
  .button-position {
    margin: auto;
  }
`;
class AppErrorBoundary extends Component {
  state = {
    hasError: false,
  };

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    log.error({ error, errorInfo });
    Sentry.captureException(error);
    AnalyticsUtil.logEvent("APP_CRASH", { error, errorInfo });
    this.setState({
      hasError: true,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Wrapper>
          <img alt="App crashed" src={AppCrashImage} />
          <div>
            <p className="bold-text">噢!发生了点意外!</p>
            <p>
              请点击下方的按钮重试 <br />
              如果问题还存在，请联系我们
            </p>
            <br />
            <Button onClick={() => window.location.reload()} size="md">
              重试
            </Button>
          </div>
        </Wrapper>
      );
    }
    // eslint-disable-next-line react/prop-types
    return this.props.children;
  }
}

export default AppErrorBoundary;
```

`componentDidCatch`方法做了以下几件事：

1. 使用`log.error`记录错误和错误信息;
2. 使用`Sentry.captureException`将错误发送到Sentry，Sentry是一个错误追踪系统，可以帮助开发者追踪和修复在生产环境中发生的错误;
3. 使用`AnalyticsUtil.logEvent`记录一个名为"APP_CRASH"的事件，事件数据包括错误和错误信息。这可以帮助开发者理解应用崩溃的情况;
4. 将组件的状态`hasError`设置为`true`。这可能会导致组件重新渲染，并显示一个错误消息或者错误页面;

### 错误追踪

- 为什么要使用错误追踪
- 方案选择
- 项目中使用

> 为什么要使用错误追踪

1. **发现错误**：用户可能会在使用应用时遇到错误，但他们可能不会报告这些错误。错误追踪可以帮助你发现这些未报告的错误。
2. **定位错误**：错误追踪通常可以提供错误的堆栈跟踪，这可以帮助你快速定位错误发生的位置。
3. **修复错误**：通过分析错误追踪中的信息，你可以更好地理解错误的原因，并找到修复错误的方法。
4. **提高用户体验**：通过快速发现和修复错误，你可以减少用户遇到错误的可能性，从而提高用户体验。

> 方案选择

Sentry开源，实时，提供页面性能监控；

Bugsnag，收费；

> 在项目中使用

前置条件：搭建Sentry客户端（推荐镜像部署）；

1. 安装 `@sentry/react @sentry/tracing`两个库；
2. 初始化，提供Sentry项目的DSN（Data Source Name）;
3. 使用Sentry的`<Sentry.ErrorBoundary>`组件来捕获组件树中的错误;

初始化

```jsx
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  integrations: [
    new Integrations.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});
```

捕获

```jsx
import * as Sentry from "@sentry/react";

function MyApp() {
  return (
    <Sentry.ErrorBoundary fallback={"An error has occurred"}>
      <MyComponent />
    </Sentry.ErrorBoundary>
  );
}
```

当`<MyComponent />`或其任何子组件抛出一个错误，这个错误会被`<Sentry.ErrorBoundary>`捕获，并被发送到Sentry项目；

其中，项目的dsn可以在sentry设置页面查看（在Sentry创建一个新的项目时，Sentry会生成一个DSN）；

> `Sentry.init()` 中，`new Integrations.BrowserTracing()` 的功能是将浏览器页面加载和导航检测作为事物，并捕获请求，指标和错误。

## 组件工厂

## 拖拽式设计

- 拖动组件原理？
- 如何放置完成？
- 

待观察：WidgetCard.tsx

> 拖动组件原理？

使用**style-component**的组件，设置**draggable**属性和监听**onDragStart**事件。其本质，是使用HTML5的拖拽API；

mdn中提到，要让HTML 元素可拖拽，必须做三件事：

- 将想要拖拽的元素的 `draggable`属性设置成 `"true"`。
- 为 `dragstart` 事件添加一个监听程序（事件处理函数）。
- 在上一步定义的监听程序中`设置拖拽数据`。

而`onDragStart`是`dragstart`事件的事件处理函数。当用户开始拖动元素时，这个函数会被调用。

其中，在onDragStart中要阻止事件的默认行为`e.preventDefault()`和事件冒泡`e.stopPropagation()`；

在拖放操作中，浏览器的默认行为可能会与自定义的拖放行为冲突，例如，浏览器可能会尝试打开正在拖动的对象（如果它是一个链接或者图片）；

同时，不希望拖动操作影响到其他元素，或者触发其他元素的`dragstart`事件处理函数，所以调用了`e.stopPropagation()`.

**代码片段**

```jsx
const onDragStart = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    AnalyticsUtil.logEvent("WIDGET_CARD_DRAG", {
      widgetType: props.details.type,
      widgetName: props.details.displayName,
    });
    setDraggingNewWidget &&
      setDraggingNewWidget(true, {
        ...props.details,
        widgetId: generateReactKey(),
      });
    deselectAll();
    closeWalkthrough();
  };
```

首先阻止了事件的默认行为和冒泡;

然后记录了一些与拖动相关的数据，如被拖动的组件的类型和名称;

然后，它调用了`setDraggingNewWidget`函数，这个函数是从`useWidgetDragResize` Hook中获取的，它的作用是设置当前正在拖动的新组件;

最后，它调用了`deselectAll`函数和`closeWalkthrough`函数，前者用于取消选择所有其他组件，后者用于关闭功能演示。



待观察：CanvasSelectionArena.tsx、DropTargetComponent.tsx

> 何时拖拽完成？



如何修改组件大小？

组件位置、大小状态如何管理？

## 用户角色

## 状态管理

- 根组件
- store.ts
- rootSaga

> 根组件

```jsx
import { Provider } from "react-redux";
import store, { runSagaMiddleware } from "./store";

runSagaMiddleware();

<Provider store={store}>
    根组件
</Provider>
```

> store.ts

```ts
import createSagaMiddleware from "redux-saga";
import { createStore, applyMiddleware } from "redux";
import appReducer from "@appsmith/reducers";
import { composeWithDevTools } from "redux-devtools-extension/logOnlyInProduction";
import { reduxBatch } from "@manaflair/redux-batch";
import routeParamsMiddleware from "RouteParamsMiddleware";
import * as Sentry from "@sentry/react";
import { ReduxActionTypes } from "@appsmith/constants/ReduxActionConstants";
import { rootSaga } from "@appsmith/sagas";

const sagaMiddleware = createSagaMiddleware();
const ignoredSentryActionTypes = [
  ReduxActionTypes.SET_EVALUATED_TREE,
  ReduxActionTypes.EXECUTE_PLUGIN_ACTION_SUCCESS,
  ReduxActionTypes.SET_LINT_ERRORS,
];
const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  actionTransformer: (action) => {
    if (ignoredSentryActionTypes.includes(action.type)) {
      // Return null to not log the action to Sentry
      action.payload = null;
    }
    return action;
  },
});
export default createStore(
  appReducer,
  composeWithDevTools(
    reduxBatch,
    applyMiddleware(sagaMiddleware, routeParamsMiddleware),
    reduxBatch,
    sentryReduxEnhancer,
  ),
);

export const runSagaMiddleware = () => sagaMiddleware.run(rootSaga);
```

根store使用了：

- reduxBatch（批量处理action,它允许你在一个同步流中派发（dispatch）多个 action，但**只触发一次 state 更新**，这可以优化性能。）
- sagaMiddleware（saga中间件）
- routeParamsMiddleware（自定义中间件）
- sentryReduxEnhancer（action被派发时运行，追踪js错误和性能）

作为**enhancer**

同时导出**runSagaMiddleware**，在应用运行时调用，以启动所有的 saga。

> :question: **为什么composeWithDevTools中reduxBatch传了两次**

这样做的原因是希望确保在 middleware 处理 action 之前和之后，都能正确地批量处理 action

> rootSaga

```tsx
export * from "ce/sagas";
import { sagas as CE_Sagas } from "ce/sagas";
import { ReduxActionTypes } from "@appsmith/constants/ReduxActionConstants";
import { call, all, spawn, race, take } from "redux-saga/effects";
import log from "loglevel";
import * as sentry from "@sentry/react";

const sagasArr = [...CE_Sagas];

export function* rootSaga(sagasToRun = sagasArr): any {
  // This race effect ensures that we fail as soon as the first safe crash is dispatched.
  // Without this, all the subsequent safe crash failures would be shown in the toast messages as well.
  const result = yield race({
    running: all(
      sagasToRun.map((saga) =>
        spawn(function* () {
          while (true) {
            try {
              yield call(saga);
              break;
            } catch (e) {
              log.error(e);
              sentry.captureException(e);
            }
          }
        }),
      ),
    ),
    crashed: take(ReduxActionTypes.SAFE_CRASH_APPSMITH),
  });
  if (result.crashed) yield call(rootSaga);
}
```

会运行所有的 saga；

每个 saga 都会被包装在一个无限循环中，这样如果 saga 抛出了一个错误，它就会被重新启动，同时这个错误会被记录，并被发送到 Sentry；

如果 saga 成功地运行了，那么它就会退出循环；

`race` effect 来同时运行所有的 saga 和一个 `take` effect；

`take` effect 会等待一个 `ReduxActionTypes.SAFE_CRASH_APPSMITH` action 被派发。如果这个 action 被派发了，那么 `rootSaga` 就会被重新调用；

这样做的目的是在应用发生了一个可安全处理的崩溃后，重新启动所有的 saga。

> :question:为何要rootSaga是生成器函数，普通函数不可以吗

生成器函数是 ES6 的一个新特性，它允许一个函数在其执行过程中被暂停和恢复；

这种能力使得 Saga 可以在异步操作（例如 API 调用）完成之后再继续执行，而不是立即返回；

这可以在Redux Saga 中实现复杂的异步流程控制；

> user模块的saga

```jsx
import userSagas from "@appsmith/sagas/userSagas";

export const sagas = [
  userSagas,
  ...
];
```



### user模块

解析user模块的状态管理，以便理解saga的工作流程；

这个模块组成部分如下：

- 组件（通过selector获取user状态，通过dispatch派发action修改user状态）
- selector（针对函数式组件，类组件则通过connect和mapStateToProps获取全局状态）
- saga（包含请求以及请求结果的处理）
- reducer（更新store中的user状态）

> 组件-获取

```tsx
import type { InjectedFormProps } from "redux-form";
import { useSelector } from "react-redux";
import type { LoginFormValues } from "pages/UserAuth/helpers";
import { getCurrentUser } from "selectors/usersSelectors";

type LoginFormProps = {
  emailValue: string;
  captcha: string;
} & InjectedFormProps<LoginFormValues, { emailValue: string }>;

export function Login(props: LoginFormProps) {
  ...
  const currentUser = useSelector(getCurrentUser);
  return ...
}
```



> 组件-修改

```tsx
import { ReduxActionTypes } from "@appsmith/constants/ReduxActionConstants";
import { SubmissionError } from "redux-form";

export type ForgotPasswordFormValues = {
  email?: string;
};

export const forgotPasswordSubmitHandler = (
  values: ForgotPasswordFormValues,
  dispatch: any,
): Promise<any> => {
  const { email } = values;
  return new Promise((resolve, reject) => {
    dispatch({
      type: ReduxActionTypes.FORGOT_PASSWORD_INIT,
      payload: {
        resolve,
        reject,
        email,
      },
    });
  }).catch((error) => {
    error.email = "";
    throw new SubmissionError(error);
  });
};
```



```tsx
import { forgotPasswordSubmitHandler } from "pages/UserAuth/helpers";
import {  toast } from "design-system";
import { createMessage } from "design-system-old/build/constants/messages";
import { FORGOT_PASSWORD_SUCCESS_TEXT } from "@appsmith/constants/messages";
import { logoutUser } from "actions/userActions";
...
const dispatch = useDispatch();
const forgotPassword = async () => {
    try {
        await forgotPasswordSubmitHandler({ email: user?.email }, dispatch);
        toast.show(createMessage(FORGOT_PASSWORD_SUCCESS_TEXT, user?.email), {
            kind: "success",
        });
        dispatch(logoutUser());
    } catch (error) {
        toast.show((error as { _error: string })._error, {
            kind: "success",
        });
    }
};
```



> selector

```jsx
import type { AppState } from "@appsmith/reducers";
import type { User } from "constants/userConstants";

export const getCurrentUser = (state: AppState): User | undefined =>
  state.ui?.users?.currentUser;
...
```



> saga

```tsx
import { takeLatest, all, call, put } from "redux-saga/effects";
import PerformanceTracker, {
  PerformanceTransactionName,
} from "utils/PerformanceTracker";
import UserApi from "@appsmith/api/UserApi";
import type { ReduxActionWithPromise } from "@appsmith/constants/ReduxActionConstants";
import type { ApiResponse } from "api/ApiResponses";
import { validateResponse, callAPI, getResponseErrorMessage } from "sagas/ErrorSagas";
import { ReduxActionTypes } from "@appsmith/constants/ReduxActionConstants";
import type { ForgotPasswordRequest } from "@appsmith/api/UserApi";
import _get from "lodash/get";
import { matchBuilderPath } from "constants/routes";
import { safeCrashAppRequest } from "actions/errorActions";

const { inCloudOS } = getAppsmithConfigs();
export function* getCurrentUserSaga() {
  try {
    PerformanceTracker.startAsyncTracking(
      PerformanceTransactionName.USER_ME_API,
    );
    const response: ApiResponse = yield call(UserApi.getCurrentUser);

    const isValidResponse: boolean = yield validateResponse(response);

    if (isValidResponse) {
      if (
        inCloudOS &&
        !_get(response.data, "cloudOSLogged") &&
        matchBuilderPath(window.location.pathname)
      ) {
        window.location.href = _get(window, "CLOUDOS_LOGIN_URL", "");
        return;
      }
      yield put({
        type: ReduxActionTypes.FETCH_USER_DETAILS_SUCCESS,
        payload: response.data,
      });
    }
  } catch (error) {
    PerformanceTracker.stopAsyncTracking(
      PerformanceTransactionName.USER_ME_API,
      { failed: true },
    );
    yield put({
      type: ReduxActionErrorTypes.FETCH_USER_DETAILS_ERROR,
      payload: {
        error,
      },
    });

    yield put(safeCrashAppRequest());
  }
}

export function* forgotPasswordSaga(
  action: ReduxActionWithPromise<ForgotPasswordRequest>,
) {
  const { email, reject, resolve } = action.payload;

  try {
    const request: ForgotPasswordRequest = { email };
    const response: ApiResponse = yield callAPI(
      UserApi.forgotPassword,
      request,
    );
    const isValidResponse: boolean = yield validateResponse(response);
    if (!isValidResponse) {
      const errorMessage: string | undefined = yield getResponseErrorMessage(
        response,
      );
      yield call(reject, { _error: errorMessage });
    } else {
      yield put({
        type: ReduxActionTypes.FORGOT_PASSWORD_SUCCESS,
      });
      yield call(resolve);
    }
  } catch (error) {
    log.error(error);
    yield call(reject, { _error: (error as Error).message });
    yield put({
      type: ReduxActionErrorTypes.FORGOT_PASSWORD_ERROR,
    });
  }
}

export default function* userSagas() {
  yield all([
    takeLatest(ReduxActionTypes.FETCH_USER_INIT, getCurrentUserSaga),
    takeLatest(ReduxActionTypes.FORGOT_PASSWORD_INIT, forgotPasswordSaga),
  ]);
}
...
```



> reducer

```ts
import type { ReduxAction } from "@appsmith/constants/ReduxActionConstants";
import { createReducer } from "utils/ReducerUtils";
import type { User } from "constants/userConstants";

export interface UsersReduxState {
  current?: User;
  list: User[];
  loadingStates: {
    fetchingUser: boolean;
    fetchingUsers: boolean;
  };
  users: User[];
  currentUser?: User;
  error: string;
  propPanePreferences?: PropertyPanePositionConfig;
  featureFlag: {
    isFetched: boolean;
    data: FeatureFlags;
  };
  productAlert: ProductAlertState;
};
const initialState: UsersReduxState = {
  loadingStates: {
    fetchingUsers: false,
    fetchingUser: true,
  },
  list: [],
  users: [],
  error: "",
  current: undefined,
  currentUser: undefined,
  featureFlag: {
    data: DEFAULT_FEATURE_FLAG_VALUE,
    isFetched: false,
  },
  productAlert: {
    config: {
      dismissed: false,
      snoozeTill: new Date(),
    },
  },
};
const usersReducer = createReducer(initialState, {
  [ReduxActionTypes.FETCH_USER_DETAILS_SUCCESS]: (
    state: UsersReduxState,
    action: ReduxAction<User>,
  ) => {
    const users = [...state.users];
    const userIndex = _.findIndex(users, { username: action.payload.username });
    if (userIndex > -1) {
      users[userIndex] = action.payload;
    } else {
      users.push(action.payload);
    }
    return {
      ...state,
      loadingStates: {
        ...state.loadingStates,
        fetchingUser: false,
      },
      users,
      currentUser: action.payload,
    };
  },
  ...
 }
```



## 网络请求

项目采用axios处理网络请求，组成如下：

- axios实例
- 请求方法封装
- 请求/响应拦截

> axios实例

```ts
import axios from "axios";
import type { AxiosInstance } from "axios";

const axiosInstance: AxiosInstance = axios.create();
```

使用axios提供的create方法创建axios实例；

> 请求方法封装

```ts
import { REQUEST_TIMEOUT_MS } from "@appsmith/constants/ApiConstants";
import { convertObjectToQueryParams } from "utils/URLUtils";

export const apiRequestConfig = {
  baseURL: "/api/",
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
};

class Api {
  static get(url: string, queryParams?: any, config: AxiosRequestConfig = {}) {
    return axiosInstance.get(url + convertObjectToQueryParams(queryParams), {
      ...apiRequestConfig,
      ...config,
    });
  }

  static post(
    url: string,
    body?: any,
    queryParams?: any,
    config: AxiosRequestConfig = {},
  ) {
    return axiosInstance.post(
      url + convertObjectToQueryParams(queryParams),
      body,
      {
        ...apiRequestConfig,
        ...config,
      },
    );
  }
}
```

对axios实例进行封装，创建常用方法；

其中convertObjectToQueryParams方法是将**js对象**转化成**URL查询参数格式**的字符串

```tsx
import _ from "lodash";

export function convertObjectToQueryParams(object: any): string {
  if (!_.isNil(object)) {
    const paramArray: string[] = _.map(_.keys(object), (key) => {
      return encodeURIComponent(key) + "=" + encodeURIComponent(object[key]);
    });
    return "?" + _.join(paramArray, "&");
  } else {
    return "";
  }
}
```

函数接收一个对象作为参数，然后检查这个对象是否为 `null` 或 `undefined`;

如果不是，它将对象的每个键值对转换为查询参数的形式（即 `key=value`），并使用 `encodeURIComponent` 函数对键和值进行编码，以确保它们在 URL 中可以安全使用;

然后，这些键值对被连接成一个字符串，每对之间用 `&` 分隔。最后，这个字符串前面加上一个 `?`，然后返回;

如果传入的对象是 `null` 或 `undefined`，函数将返回空字符串 `""`;

例如，如果你有一个对象 `{a: 1, b: 2}`，这个函数将返回字符串 `"?a=1&b=2"`;



> 请求/响应拦截

```ts
import {
  apiFailureResponseInterceptor,
  apiRequestInterceptor,
  apiSuccessResponseInterceptor,
  blockedApiRoutesForAirgapInterceptor,
} from "@appsmith/api/ApiUtils";

const requestInterceptors = [
  blockedApiRoutesForAirgapInterceptor,
  apiRequestInterceptor,
];
requestInterceptors.forEach((interceptor) => {
  axiosInstance.interceptors.request.use(interceptor as any);
});

axiosInstance.interceptors.response.use(
  apiSuccessResponseInterceptor,
  apiFailureResponseInterceptor,
);
```

**blockedApiRoutesForAirgapInterceptor**拦截器的用途是模拟断网下的成功响应，但是没返回任何数据(用户体验、容错处理，便于测试和开发)；

```ts
import { isAirgapped } from "@appsmith/utils/airgapHelpers";

export const BLOCKED_ROUTES = [
  "v1/app-templates",
  "v1/marketplace",
  "v1/datasources/mocks",
  "v1/usage-pulse",
  "v1/applications/releaseItems",
  "v1/saas",
];
export const BLOCKED_ROUTES_REGEX = new RegExp(
  `^(${BLOCKED_ROUTES.join("|")})($|/)`,
);
export const blockedApiRoutesForAirgapInterceptor = (
  config: AxiosRequestConfig,
) => {
  const { url } = config;
  const isAirgappedInstance = isAirgapped();
  if (isAirgappedInstance && url && BLOCKED_ROUTES_REGEX.test(url)) {
    return Promise.resolve({ data: null, status: 200 });
  }
  return config;
};
```

调用 `isAirgapped` 函数来检查当前的实例是否与外部网络隔离；

如果当前实例的isAirgappedInstance为true，并且 URL 存在，并且 URL 符合 `BLOCKED_ROUTES_REGEX` 正则表达式的规则，那么函数将返回一个解析为具有 `data: null` 和 `status: 200` 的对象的 Promise；

如果当前实例的isAirgappedInstance为false，或者 URL 不存在，或者 URL 不符合 `BLOCKED_ROUTES_REGEX` 的规则，那么函数将直接返回原始的配置对象。

**请求拦截**

**apiRequestInterceptor**拦截器

```ts
import type { AxiosRequestConfig } from "axios";
import { getCurrentGitBranch } from "selectors/gitSyncSelectors";
import getQueryParamsObject from "utils/getQueryParamsObject";
import {
  getCurrentEnvironment,
  getCurrentEditingEnvID,
} from "@appsmith/utils/Environments";
import AnalyticsUtil from "utils/AnalyticsUtil";
import { getAppsmithConfigs } from "@appsmith/configs";

const appsmithConfig = getAppsmithConfigs();
export const apiRequestInterceptor = (config: AxiosRequestConfig) => {
  config.headers = config.headers ?? {};

  // Add header for CSRF protection.
  const methodUpper = config.method?.toUpperCase();
  if (methodUpper && methodUpper !== "GET" && methodUpper !== "HEAD") {
    config.headers["X-Requested-By"] = "Appsmith";
  }

  const branch =
    getCurrentGitBranch(store.getState()) || getQueryParamsObject().branch;
  if (branch && config.headers) {
    config.headers.branchName = branch;
  }
  if (config.url?.indexOf("/git/") !== -1) {
    config.timeout = 1000 * 120; // increase timeout for git specific APIs
  }

  // Add header for environment name
  const activeEnv = getCurrentEnvironment();

  if (activeEnv && config.headers) {
    if (config.url?.indexOf("/code") !== -1) {
      config.headers.environmentId = getCurrentEditingEnvID();
    } else {
      config.headers.environmentId = activeEnv;
    }
  }

  const anonymousId = AnalyticsUtil.getAnonymousId();
  appsmithConfig.segment.enabled &&
    anonymousId &&
    (config.headers["x-anonymous-user-id"] = anonymousId);

  return { ...config, timer: performance.now() };
};
```

函数首先确保 `config.headers` 存在，如果不存在，就将其设置为一个空对象 `{}`;

然后，函数检查**请求的方法**是否是 "GET" 或 "HEAD"。如果不是，它将在请求头中添加一个 "**X-Requested-By**" 字段，值为 "Appsmith"。这通常用于 CSRF 保护;

接着，函数获取当前的 **Git 分支名**，如果存在，就将其添加到请求头的 "branchName" 字段;

如果请求的 **URL** 包含 "/git/"，函数将请求的**超时时间**设置为 120 秒。这是因为 Git 相关的 API 可能需要更长的时间来处理;

然后，函数获取当前的**环境名**，如果存在，就将其添加到请求头的 "environmentId" 字段。如果请求的 URL 包含 "/code"，则 "environmentId" 的值会被设置为当前正在编辑的环境 ID。

最后，如果启用了 Segment 分析，并且存在匿名用户 ID，函数将在请求头中添加一个 "**x-anonymous-user-id**" 字段，值为匿名用户 ID。

在所有这些修改之后，函数返回一个**新的配置对象**，其中包含原始的配置和一个新的 "timer" 字段，值为当前的性能时间。

**响应拦截**

**apiSuccessResponseInterceptor**拦截器

```ts
import type { ActionExecutionResponse } from "api/ActionAPI";

const executeActionRegex = /actions\/execute/;
const makeExecuteActionResponse = (response: any): ActionExecutionResponse => ({
  ...response.data,
  clientMeta: {
    size: response.headers["content-length"],
    duration: Number(performance.now() - response.config.timer).toFixed(),
  },
});
export const apiSuccessResponseInterceptor = (
  response: AxiosResponse,
): AxiosResponse["data"] => {
  if (response.config.url) {
    if (response.config.url.match(executeActionRegex)) {
      return makeExecuteActionResponse(response);
    }
  }
  if (
    response.headers[CONTENT_TYPE_HEADER_KEY] === "application/json" &&
    !response.data.responseMeta
  ) {
    Sentry.captureException(new Error("Api responded without response meta"), {
      contexts: { response: response.data },
    });
  }
  return response.data;
};
```

函数首先检查响应的 URL 是否匹配 `executeActionRegex` 正则表达式。如果匹配，它将调用 `makeExecuteActionResponse` 函数处理响应，并返回处理后的结果。

函数检查响应的 `Content-Type` 是否为 "application/json"，并且响应的数据中是否没有 `responseMeta` 字段。如果这两个条件都满足，它将使用 Sentry 捕获一个新的错误，错误信息为 "Api responded without response meta"，并将响应的数据作为错误的上下文。

最后，如果以上的条件都不满足，函数将直接返回响应的数据。

**apiFailureResponseInterceptor**拦截器

```ts
import {
  createMessage,
  ERROR_0,
  ERROR_413,
  ERROR_500,
  GENERIC_API_EXECUTION_ERROR,
  SERVER_API_TIMEOUT_ERROR,
} from "@appsmith/constants/messages";
import store from "store";
import {
  API_STATUS_CODES,
  ERROR_CODES,
  SERVER_ERROR_CODES,
} from "@appsmith/constants/ApiConstants";
import { logoutUser } from "actions/userActions";

const executeActionRegex = /actions\/execute/;
const timeoutErrorRegex = /timeout of (\d+)ms exceeded/;
export const axiosConnectionAbortedCode = "ECONNABORTED";
const makeExecuteActionResponse = (response: any): ActionExecutionResponse => ({
  ...response.data,
  clientMeta: {
    size: response.headers["content-length"],
    duration: Number(performance.now() - response.config.timer).toFixed(),
  },
});
const is404orAuthPath = () => {
  const pathName = window.location.pathname;
  return /^\/404/.test(pathName) || /^\/user\/\w+/.test(pathName);
};
export const apiFailureResponseInterceptor = (error: any) => {
  // this can be extended to other errors we want to catch.
  // in this case it is 413.
  if (error && error?.response && error?.response.status === 413) {
    return Promise.reject({
      ...error,
      clientDefinedError: true,
      statusCode: "AE-APP-4013",
      message: createMessage(ERROR_413, 100),
      pluginErrorDetails: {
        appsmithErrorCode: "AE-APP-4013",
        appsmithErrorMessage: createMessage(ERROR_413, 100),
        errorType: "INTERNAL_ERROR", // this value is from the server, hence cannot construct enum type.
        title: createMessage(GENERIC_API_EXECUTION_ERROR),
      },
    });
  }

  // Return error when there is no internet
  if (!window.navigator.onLine) {
    return Promise.reject({
      ...error,
      message: createMessage(ERROR_0),
    });
  }

  // Return if the call was cancelled via cancel token
  if (axios.isCancel(error)) {
    throw new UserCancelledActionExecutionError();
  }

  // Return modified response if action execution failed
  if (error.config && error.config.url.match(executeActionRegex)) {
    return makeExecuteActionResponse(error.response);
  }
  // Return error if any timeout happened in other api calls
  if (
    error.code === axiosConnectionAbortedCode &&
    error.message &&
    error.message.match(timeoutErrorRegex)
  ) {
    return Promise.reject({
      ...error,
      message: createMessage(SERVER_API_TIMEOUT_ERROR),
      code: ERROR_CODES.REQUEST_TIMEOUT,
    });
  }

  if (error.response) {
    if (error.response.status === API_STATUS_CODES.SERVER_ERROR) {
      return Promise.reject({
        ...error,
        code: ERROR_CODES.SERVER_ERROR,
        message: createMessage(ERROR_500),
      });
    }

    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (!is404orAuthPath()) {
      const currentUrl = `${window.location.href}`;
      if (error.response.status === API_STATUS_CODES.REQUEST_NOT_AUTHORISED) {
        // Redirect to login and set a redirect url.
        store.dispatch(
          logoutUser({
            redirectURL: `${AUTH_LOGIN_URL}?redirectUrl=${encodeURIComponent(
              currentUrl,
            )}`,
          }),
        );
        Sentry.captureException(error);
        return Promise.reject({
          ...error,
          code: ERROR_CODES.REQUEST_NOT_AUTHORISED,
          message: "未授权，重定向回登录页...",
          show: false,
        });
      }
      const errorData = error.response.data.responseMeta ?? {};
      if (
        errorData.status === API_STATUS_CODES.RESOURCE_NOT_FOUND &&
        (SERVER_ERROR_CODES.RESOURCE_NOT_FOUND.includes(errorData.error.code) ||
          SERVER_ERROR_CODES.UNABLE_TO_FIND_PAGE.includes(errorData.error.code))
      ) {
        Sentry.captureException(error);
        return Promise.reject({
          ...error,
          code: ERROR_CODES.PAGE_NOT_FOUND,
          message: "Resource Not Found",
          show: false,
        });
      }
    }
    if (error.response.data.responseMeta) {
      return Promise.resolve(error.response.data);
    }
    Sentry.captureException(new Error("Api responded without response meta"), {
      contexts: { response: error.response.data },
    });
    return Promise.reject(error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    log.error(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    log.error("Error", error.message);
  }
  log.debug(error.config);
  return Promise.resolve(error);
};

```

这个拦截器进行不同错误类型处理：

- 错误存在且响应状态码为413
- 断网
- 请求取消
- action执行失败
- api调用超时
- 服务器500、未授权后重定向、资源未找到、没有responseMeta

最后，如果错误的响应对象不存在，但错误的请求对象存在，函数将记录错误的请求对象。如果错误的请求对象也不存在，函数将记录错误的消息。

### user模块

```tsx
import Api from "api/Api";
import type { ApiResponse } from "api/ApiResponses";
import type { AxiosPromise } from "axios";

export interface ForgotPasswordRequest {
  email: string;
}
export class UserApi extends Api {
    static currentUserURL = "v1/users/me";
    static forgotPasswordURL = `${UserApi.usersURL}/forgotPassword`;
    
    static getCurrentUser(): AxiosPromise<ApiResponse> {
        return Api.get(UserApi.currentUserURL);
    }
    static forgotPassword( request: ForgotPasswordRequest ): AxiosPromise<ApiResponse> {
        return Api.post(UserApi.forgotPasswordURL, request);
    }
}
```



## 单元测试

# 状态

| 状态 | 说明 |      |
| ---- | ---- | ---- |
|      |      |      |
|      |      |      |
|      |      |      |



# 接口-影响状态

## 登录页

| 接口路径                                   | 涉及状态【action】   | 说明           | 参数                                               | 状态入口   |
| ------------------------------------------ | -------------------- | -------------- | -------------------------------------------------- | ---------- |
| ，，，，，，，，，，，，，，，，，，，，， | ，，，，，，，，，， | ，，，，，，， | ，，，，，，，，，，，，，，，，，，，，，，，，， | ，，，，， |
| /api/v1/captcha?                           |                      | 登录验证码     |                                                    |            |
| /api/v1/login?redirectUrl=xxx/applications |                      | 登录           | redirectUrl、username、password、verificationCode  |            |
| /api/v1/logout                             |                      | 登出           |                                                    |            |
|                                            |                      |                |                                                    |            |
|                                            |                      |                |                                                    |            |

## 首页

| 接口路径                                         | 涉及状态【action】                                           | 说明                     | 参数                                 | 状态入口                                                     |
| ------------------------------------------------ | ------------------------------------------------------------ | ------------------------ | ------------------------------------ | ------------------------------------------------------------ |
| ，，，，，，，，，，，，，，，                   | ，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，， | ，，，，，，，，，，，， | ，，，，，，，，，，，，，，，，，， |                                                              |
| /api/v1/users/me                                 | entities-app-user【FETCH_USER_DETAILS_SUCCESS】<br />ui-users-currentUser | 个人信息                 | -                                    | app\client\src\reducers\entityReducers\appReducer.ts<br />app\client\src\reducers\uiReducers\usersReducer.ts |
| /api/v1/users/features                           | ui-users-featureFlag【FETCH_FEATURE_FLAGS_SUCCESS】          |                          | -                                    | app\client\src\reducers\uiReducers\usersReducer.ts           |
| /api/v1/product-alert/alert                      | ui-users-productAlert【FETCH_PRODUCT_ALERT_SUCCESS】         | 生产警告                 | -                                    | app\client\src\reducers\uiReducers\usersReducer.ts           |
| /api/v1/tenants/current                          | settings-config【FETCH_CURRENT_TENANT_CONFIG_SUCCESS】<br />tenant-userPermissions、tenantConfiguration | 租户配置/用户权限        | -                                    | app\client\src\ce\reducers\settingsReducer.ts<br />app\client\src\ce\reducers\tenantReducer.ts |
| /api/v1/applications/releaseItems                | mock数据                                                     | tag版本信息              | -                                    | app\client\src\mockResponses\FetchReleasesMockResponse.json  |
| /api/v1/applications/new                         | ui-applications-userWorkspaces【FETCH_USER_APPLICATIONS_WORKSPACES_SUCCESS】 | 获取应用组               | -                                    | app\client\src\ce\reducers\uiReducers\applicationsReducer.tsx |
| /api/v1/applications/import/:workspaceId         | ui-applications-importedApplication【IMPORT_APPLICATION_SUCCESS】 | 导入应用到应用组         | workspaceId、file                    | app\client\src\ce\reducers\uiReducers\applicationsReducer.tsx |
| /api/v1/workspaces                               | ui-userWorkspaces【CREATE_WORKSPACE_SUCCESS】                | 新建应用组               | name                                 | app\client\src\ce\reducers\uiReducers\workspaceReducer.ts    |
| /api/v1/workspaces/:workspaceId                  | ui-userWorkspaces【DELETE_WORKSPACE_SUCCESS】                | 删除应用组               | workspaceId                          |                                                              |
| /api/v1/workspaces/:workspaceId                  | ui-userWorkspaces【SAVE_WORKSPACE_SUCCESS】                  | 修改应用组名称/网站/邮箱 | workspaceId、name/website/Email      |                                                              |
| /api/v1/workspaces/:workspaceId/logo             | ui-userWorkspaces【SAVE_WORKSPACE_SUCCESS】                  | 修改应用组logo           | workspaceId、file                    |                                                              |
| /api/v1/workspaces/:workspaceId/members          | ui-userWorkspaces-workspaceUsers【FETCH_ALL_USERS_SUCCESS】  | 获取应用组成员           |                                      |                                                              |
| /api/v1/workspaces/:workspaceId/permissionGroups | ui-userWorkspaces-workspaceRoles【FETCH_ALL_ROLES_SUCCESS】  |                          |                                      |                                                              |

## 编辑页

| 接口路径                                                     | 涉及状态【action】                                           | 说明                 | 参数                                                         | 状态入口                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ，，，，，，，，，，，，，，，，，，，，，，，，，，，，，， | ，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，， | ，，，，，，，，，， | ，，，，，，，，，，                                         | ，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，， |
| /api/v1/pages?pageId=pageId&mode=EDIT                        | ui-applications-currentApplication【FETCH_APPLICATION_SUCCESS】<br />entity-pageList【FETCH_PAGE_LIST_SUCCESS】<br />ui-workspaces【SET_CURRENT_WORKSPACE_ID】 | 生成导入应用的页面   | pageId、mode                                                 | app\client\src\ce\reducers\uiReducers\applicationsReducer.tsx<br />app\client\src\reducers\entityReducers\pageListReducer.tsx<br />app\client\src\ee\reducers\uiReducers\workspaceReducer.tsx |
| /api/v1/pages/:pageId                                        | ui-mainCanvas、editor【INIT_CANVAS_LAYOUT】<br />entity-canvasWidgets、canvasWidgetsStructureReducer、metaWidgets | 获取页面             | pageId                                                       | app\client\src\reducers\uiReducers\editorReducer.tsx<br />app\client\src\reducers\entityReducers\index.ts |
| /api/v1/actions?applicationId=applicationId                  | entity-actions【FETCH_ACTIONS_SUCCESS】                      | 获取actions          | applicationId                                                | app\client\src\reducers\entityReducers\actionsReducer.tsx    |
| /api/v1/collections/actions?=applicationId                   | entity-jsActions【FETCH_JS_ACTIONS_SUCCESS】                 | 获取jsActions        | applicationId                                                | app\client\src\reducers\entityReducers\jsActionsReducer.tsx  |
| /api/v1/actions/:actionId                                    | entity-actions【UPDATE_ACTION_SUCCESS】<br />ui-queryPane    | 更新actions          | actionConfiguration<br />applicationId<br />autoComplete<br />confirmBeforeExecute<br />datasource<br />dynamicBindingPathList<br />eventData<br />executeOnLoad<br />id<br />invalids<br />isValid<br />jsonPathKeys<br />messages<br />pageId<br />pluginId<br />pluginType<br />userPermissions<br />validName<br />workspaceId<br /> | app\client\src\reducers\entityReducers\actionsReducer.tsx<br />app\client\src\reducers\uiReducers\queryPaneReducer.ts |
|                                                              |                                                              |                      |                                                              |                                                              |
| /api/v1/plugins/:id/form                                     | entity-plugins【FETCH_PLUGIN_FORM_CONFIGS_SUCCESS】          | 获取plugin相关配置   | pluginId                                                     | app\client\src\reducers\entityReducers\pluginsReducer.ts     |
| /api/v1/themes/applications/:applicationId/current?mode=EDIT | ui-appTheming-selectedTheme【FETCH_SELECTED_APP_THEME_SUCCESS】 | 获取选中的主题       | applicationId、mode                                          | app\client\src\reducers\uiReducers\appThemingReducer.ts      |
| /api/v1/themes/applications/:applicationId                   | ui-appTheming-themes【FETCH_APP_THEMES_SUCCESS】             | 获取应用主题         | applicationId                                                | app\client\src\reducers\uiReducers\appThemingReducer.ts      |
|                                                              |                                                              |                      |                                                              |                                                              |
| /api/v1/applications/snapshot/:applicationId                 |                                                              |                      |                                                              |                                                              |
|                                                              |                                                              |                      |                                                              |                                                              |
|                                                              |                                                              |                      |                                                              |                                                              |

## 管理员设置页

| 接口路径                                             | 涉及状态                                     | 说明                 | 参数 | 状态入口                                      |
| ---------------------------------------------------- | -------------------------------------------- | -------------------- | ---- | --------------------------------------------- |
|                                                      | ，，，，，，，，，，，，，，，，，，，，，， | ，，，，，，，，，， |      |                                               |
| /api/v1/admin/env                                    | settings-config                              | env配置              | -    | app\client\src\ce\reducers\settingsReducer.ts |
|                                                      |                                              |                      |      |                                               |
|                                                      |                                              |                      |      |                                               |
|                                                      |                                              |                      |      |                                               |
|                                                      |                                              |                      |      |                                               |
| /api/v1/wxLogin/code                                 |                                              | 微信登录二维码       |      |                                               |
| /api/v1/plugins?workspaceId=64bfd3bfcc55337d325c4380 |                                              | 数据源列表           |      |                                               |
|                                                      |                                              |                      |      |                                               |

# 疑问

## **1.更新管理员配置？**

1. 点击**保存&重启**按钮

2. **SettingsForm**组件使用**saveAdminSettings**组件，传递点击事件；

3. 必填字段校验，判断env或tenant设置，dispatch **saveSettings**或**updateTenantConfig**的action

4. 根据ReduxActionTypes.SAVE_ADMIN_SETTINGS**类型**调用**reducer**，调用**SaveAdminSettingsSaga**,接着调用**UserApi.saveAdminSettings**发起请求(请求参数是props.settings,是有修改的字段)；

5. 或者根据ReduxActionTypes.UPDATE_TENANT_CONFIG**类型**调用**reducer**，调用**updateTenantConfigSaga()**,接着调用**TenantApi.updateTenantConfig**发起请求(请求参数是props.settings,是有修改的字段)；

   

**SettingsForm.tsx**

```tsx
const onSave = () => {
    if (checkMandatoryFileds()) {
      if (saveAllowed(props.settings, isFormLoginEnabled, socialLoginList)) {
        AnalyticsUtil.logEvent("ADMIN_SETTINGS_SAVE", {
          method: pageTitle,
        });
        saveChangedSettings();
      } else {
        saveBlocked();
      }
    } else {
      AnalyticsUtil.logEvent("ADMIN_SETTINGS_ERROR", {
        error: createMessage(MANDATORY_FIELDS_ERROR),
      });
      Toaster.show({
        text: createMessage(MANDATORY_FIELDS_ERROR),
        variant: Variant.danger,
      });
    }
  };
```

**saveChangedSettings**

```tsx
const saveChangedSettings = () => {
    const settingsKeyLength = Object.keys(props.settings).length;
    const isOnlyEnvSettings =
      updatedTenantSettings.length === 0 && settingsKeyLength !== 0;
    const isEnvAndTenantSettings =
      updatedTenantSettings.length !== 0 &&
      updatedTenantSettings.length !== settingsKeyLength;
    if (isOnlyEnvSettings) {
      // only env settings
      dispatch(saveSettings(props.settings));
    } else {
      // only tenant settings
      const config: any = {};
      for (const each in props.settings) {
        if (tenantConfigConnection.includes(each)) {
          config[each] = props.settings[each];
        }
      }
      dispatch(
        updateTenantConfig({
          tenantConfiguration: config,
          isOnlyTenantSettings: !isEnvAndTenantSettings,
        }),
      );
      // both env and tenant settings
      if (isEnvAndTenantSettings) {
        const filteredSettings = Object.keys(props.settings)
          .filter((key) => !isTenantConfig(key))
          .reduce((obj, key) => {
            return Object.assign(obj, {
              [key]: props.settings[key],
            });
          }, {});
        dispatch(saveSettings(filteredSettings));
      }
    }
  };
```

**settingReducer.ts**

```ts
[ReduxActionTypes.SAVE_ADMIN_SETTINGS]: (state: SettingsReduxState) => ({
    ...state,
    isSaving: true,
  }),
```

**ReducerUtils.ts**

```ts
export const createReducer = (
  initialState: any,
  handlers: { [type: string]: (state: any, action: any) => any },
) => {
  return function reducer(state = initialState, action: ReduxAction<any>) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    } else {
      return state;
    }
  };
};
```

**SuperUserSagas.tsx**

```tsx
export function* InitSuperUserSaga(action: ReduxAction<User>) {
  const user = action.payload;
  if (user.isSuperUser) {
    yield all([
      takeLatest(ReduxActionTypes.FETCH_ADMIN_SETTINGS, FetchAdminSettingsSaga),
      takeLatest(
        ReduxActionTypes.FETCH_ADMIN_SETTINGS_ERROR,
        FetchAdminSettingsErrorSaga,
      ),
      takeLatest(ReduxActionTypes.SAVE_ADMIN_SETTINGS, SaveAdminSettingsSaga),
      takeLatest(ReduxActionTypes.RESTART_SERVER_POLL, RestartServerPoll),
      takeLatest(
        ReduxActionTypes.RETRY_RESTART_SERVER_POLL,
        RestryRestartServerPoll,
      ),
      takeLatest(ReduxActionTypes.SEND_TEST_EMAIL, SendTestEmail),
    ]);
  }
}
```

**SuperUserSagas.tsx**

```tsx
export function* SaveAdminSettingsSaga(
  action: ReduxAction<{
    settings: Record<string, any>;
    needsRestart: boolean;
  }>,
) {
  const { needsRestart = true, settings } = action.payload;

  try {
    const response: ApiResponse = yield call(
      UserApi.saveAdminSettings,
      settings,
    );
    const isValidResponse: boolean = yield validateResponse(response);

    if (isValidResponse) {
      Toaster.show({
        text: "保存成功",
        variant: Variant.success,
      });
      yield put({
        type: ReduxActionTypes.SAVE_ADMIN_SETTINGS_SUCCESS,
      });

      yield put(getCurrentTenant());

      yield put({
        type: ReduxActionTypes.FETCH_ADMIN_SETTINGS_SUCCESS,
        payload: settings,
      });

      if (needsRestart) {
        yield put({
          type: ReduxActionTypes.RESTART_SERVER_POLL,
        });
      }
    } else {
      yield put({
        type: ReduxActionTypes.SAVE_ADMIN_SETTINGS_ERROR,
      });
    }
  } catch (e) {
    yield put({
      type: ReduxActionTypes.SAVE_ADMIN_SETTINGS_ERROR,
    });
  }
}
```

**UserApi.tsx**

```tsx
static saveAdminSettings(
    request: Record<string, string>,
  ): AxiosPromise<ApiResponse> {
    return Api.put(UserApi.adminSettingsURL, request);
  }
```

## 2.管理员设置页面设计？

1. 入口调用**ConfigFactory.register()**,传入配置;

在ce/pages/AdminSettings/config

**index.ts**

```ts
ConfigFactory.register(GeneralConfig);
ConfigFactory.register(EmailConfig);
ConfigFactory.register(MiniConfig);
ConfigFactory.register(MapsConfig);
ConfigFactory.register(BaiduMapsConfig);
ConfigFactory.register(Authentication);
ConfigFactory.register(AdvancedConfig);
ConfigFactory.register(VersionConfig);
ConfigFactory.register(BrandingConfig);
```

## 3.普通邮箱如何升为管理员？

## 4.组件拖到画布后，是如何渲染出来的？

## 5.工作区的配置栏如何渲染出来的

# 页面-路由-结构-逻辑

|                页面                |                             路由                             |                             入口                             |                             结构                             |                           包含逻辑                           |
| :--------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
| ，，，，，，，，，，，，，，，，， | ，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，， |                                                              | ，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，，， |                ，，，，，，，，，，，，，，，                |
|               欢迎页               |                        /setup/welcome                        |                  src\pages\setup\index.tsx                   |                                                              |                                                              |
|               登录页               |                         /user/login                          |                                                              |                                                              |                                                              |
|               注册页               |                         /user/signup                         |                                                              |                                                              |                                                              |
|             忘记密码页             |                                                              |                                                              |                                                              |                                                              |
|                首页                |                        /applications                         |        app\client\src\ce\pages\Applications\index.tsx        |                                                              |                                                              |
|                                    |                                                              |                                                              |                                                              |                                                              |
|                                    |                                                              |                                                              |                                                              |                                                              |
|            管理员设置页            |              /settings/${xxx}，general是通用栏               |       app\client\src\ce\pages\AdminSettings\index.tsx        |               1）侧边栏<br />2）详细配置<br />               |                                                              |
|         管理员设置-侧边栏          |                                                              |      app\client\src\ce\pages\AdminSettings\LeftPane.tsx      |                                                              |                                                              |
|        管理员设置-详细配置         |                                                              |        app\client\src\ce\pages\AdminSettings\Main.tsx        |                                                              |                                                              |
|         工作区-应用编辑页          |       /app/1/page1-6523de68897f404778e147cd/edit<br />       |               app\client\src\ce\AppRouter.tsx                |              1）应用头部<br />2）动态内容<br />              |                      首次加载完成<br />                      |
|     工作区-应用编辑页-应用头部     |                                                              |         app\client\src\pages\Editor\EditorHeader.tsx         |         1）左侧<br />2）中间搜索<br />3）右侧<br />          | 首次加载完成<br />1）<br />移动到菜单<br />钉住<br />3）<br />发布<br /> |
|      工作区-应用编辑页-开发区      |                                                              |        app\client\src\pages\Editor\MainContainer.tsx         |               1）中间内容<br />2）底部栏<br />               |    1）<br />左侧边栏宽度改变<br />左侧边栏拖拽结束<br />     |
|  工作区-应用编辑页-开发区-侧边栏   |                                                              |    app\client\src\components\editorComponents\Sidebar.tsx    | 1）页面列表<br />2）组件属性<br />3）资源管理器<br />4）宽度调整器<br /> | 首次加载完成<br />4）<br />鼠标移动<br />移动到宽度调整器<br />移动到宽度调整器结束<br /> |
|   工作区-应用编辑页-开发区-画布    |                                                              | app\client\src\pages\Editor\WidgetsEditor\CanvasContainer.tsx |                                                              |                                                              |
| 工作区-应用编辑页-开发区-属性配置  |                                                              |      app\client\src\pages\Editor\PropertyPane\index.tsx      |                                                              |                                                              |
|         工作区-应用发布页          |                                                              |                                                              |                                                              |                                                              |
|         工作区-应用设置页          |          /app/1/page1-654afa6b7bdbbb67f235fbdd/edit          | app\client\src\pages\Editor\AppSettingsPane\AppSettings\index.tsx |                                                              |                                                              |
|      工作区-查询-语句编辑器页      | /app/1/page1-6548c8dc80e6013da9f4dfd4/edit/queries/65499ead80e6013da9f4dfdd |        app\client\src\pages\Editor\MainContainer.tsx         | （左）侧边栏-app\client\src\components\editorComponents\Sidebar.tsx<br />（右）右边-app\client\src\pages\Editor\routes.tsx<br />代码编辑器-app\client\src\components\editorComponents\CodeEditor\EvaluatedValuePopup.tsx |                                                              |
|       工作区-应用菜单编辑页        |   /app/1/page1-654de37eb2d32269df5718c2/edit/viewerlayout    |   app\client\src\pages\Editor\ViewerLayoutEditor\index.tsx   |              1）顶部导航<br />2）菜单导航<br />              | 2）<br />获取当前应用布局数据<br />首次加载完成<br />初始化新树数据<br />关闭菜单编辑<br />增加节点<br />开始拖拽<br />拖拽完成<br />图标选择<br />修改节点名字<br />删除节点<br />隐藏节点<br />保存配置<br /> |
|             个人信息页             |                           /profile                           |               src\pages\UserProfile\index.tsx                |                                                              |                                                              |

## 共同入口

| 页面                 | 共同入口                                | 逻辑 |
| -------------------- | --------------------------------------- | ---- |
| 登录、注册、忘记密码 | app\client\src\pages\UserAuth\index.tsx |      |
|                      |                                         |      |
|                      |                                         |      |



# 功能

## 工作区

**核心功能**：

- 资源管理器
  - 组件
  - 查询/JS对象
  - 数据源
  - 工具库
- 画布渲染
- 属性配置
- 全局搜索

**资源管理器**

| 主体 | 功能点                                                       | 标记        |
| ---- | ------------------------------------------------------------ | ----------- |
| 组件 | 侧边栏显示<br />拖动<br />复制<br />编辑<br />删除<br />画布渲染<br />配置更新<br />事件绑定<br />引用变量 | 已理解-done |
|      |                                                              |             |
|      |                                                              |             |

## 首页

**核心功能**

- 应用组

| 主体   | 功能点   |      |
| ------ | -------- | ---- |
| 应用组 | 导入应用 |      |
|        |          |      |
|        |          |      |



# 权限控制

**高阶组件鉴权**

对于路由**/setup/welcome**,本来应该渲染**Setup**组件，由于高阶组件的鉴权，重定向到路由**/applications**；

**Setup.tsx**

```tsx
function Setup() {
  const user = useSelector(getCurrentUser);
  console.log("user", user);

  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);
   if (!user?.emptyInstance) {
     return <Redirect to={AUTH_LOGIN_URL} />;
   }
  return (
    <StyledSetupContainer>
      {showLandingPage ? (
        <LandingPage
          forSuperUser
          onGetStarted={() => setShowLandingPage(false)}
        />
      ) : (
        <SetupForm />
      )}
    </StyledSetupContainer>
  );
}

export default requiresUnauth(Setup);

```

当用户的emptyInstance为false，也就是用户未登录时，会从定向到`AUTH_LOGIN_URL` （**/user/login**）

**requiresUnauth**

```tsx
export const requiresUnauth = (Component: React.ComponentType) => {
  function Wrapped(props: any) {
    const user = useSelector(getCurrentUser);
    if (!user) return null;
    if (user?.email && user?.email !== ANONYMOUS_USERNAME) {
      return <Redirect to={APPLICATIONS_URL} />;
    }
    return <Component {...props} />;
  }

  return Wrapped;
};
```

`requiresUnauth`用于要求用户未登录才能访问某个路由（组件）

- 如果用户未登录（`user`为`null`），返回`null`，即不渲染任何内容。
- 如果用户已登录且具有有效的电子邮件（不是匿名用户），则重定向到`APPLICATIONS_URL`(**/application**)路径。
- 否则，渲染原始的传入组件，并传递相应的`props`。

反之，`requiresAuth`用于要求用户登录才能访问某个路由（组件）

# 类型验证

## 嵌套的对象数组

检查数组中的值是否唯一，如果验证失败，会返回相应的错误信息。

```ts
[ValidationTypes.NESTED_OBJECT_ARRAY]: (
    config: ValidationConfig,
    value: unknown,
    props: Record<string, unknown>,
    propertyPath: string,
  ): ValidationResponse => {
    let response: ValidationResponse = {
      isValid: false,
      parsed: config.params?.default || [],
      messages: [
        {
          name: "TypeError",
          message: `${WIDGET_TYPE_VALIDATION_ERROR} ${getExpectedType(config)}`,
        },
      ],
    };
    response = VALIDATORS.ARRAY(config, value, props, propertyPath);

    if (!response.isValid) {
      return response;
    }
    // Check if all values and children values are unique
    if (config.params?.unique && response.parsed.length) {
      if (isArray(config.params?.unique)) {
        for (const param of config.params?.unique) {
          const flattenedArray = flat(response.parsed, param);
          const shouldBeUnique = flattenedArray.map((entry) =>
            get(entry, param, ""),
          );
          if (uniq(shouldBeUnique).length !== flattenedArray.length) {
            response = {
              ...response,
              isValid: false,
              messages: [
                {
                  name: "ValidationError",
                  message: `path:${param} must be unique. Duplicate values found`,
                },
              ],
            };
          }
        }
      }
    }
    return response;
  }
```

1. 首先，函数创建一个初始的验证响应对象 `response`，将其设置为无效状态，并设置默认的解析值和错误消息。

2. 然后，函数调用 `VALIDATORS.ARRAY`，这是一个名为 `ARRAY` 的其他验证函数，用于验证值是否是一个数组。这里将 `config`、`value`、`props` 和 `propertyPath` 参数传递给 `ARRAY` 函数，并将返回的验证响应赋给 `response`。

3. 如果 `response.isValid` 为 `false`，即值不是一个数组，函数直接返回 `response`。

4. 接下来，函数检查配置中的 `params.unique` 是否存在，并且 `response.parsed` 的长度大于 0。如果满足条件，进入下一步。

5. 如果 `config.params.unique`

   是一个数组，函数遍历该数组，并为每个参数执行以下操作：

   - 使用 `flat` 函数将 `response.parsed` 数组扁平化，并提取指定的参数路径。
   - 将提取的参数值数组传递给 `uniq` 函数，以获取唯一的值数组。
   - 如果唯一的值数组的长度不等于扁平化数组的长度，表示存在重复的值，将更新 `response` 对象的属性，将其标记为无效，并添加相应的错误消息。

6. 最后，函数返回更新后的 `response` 对象。

需要 `WIDGET_TYPE_VALIDATION_ERROR`、`getExpectedType`、`VALIDATORS.ARRAY`、`flat`、`get`、`uniq`





