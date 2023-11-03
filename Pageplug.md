# 技术清单

## 前端

**组件库**：ant-design、design-system

**框架**：React

**状态管理**：Redux、Redux-Saga

**可视化**：fusioncharts、

待归类：blueprintjs、draft-js-plugins、formily、googlemaps、github/g-emoji-element、loadable、manaflair/redux-batch



| 技术        | 标签             | 说明 |
| ----------- | ---------------- | ---- |
| redux-sagas | *状态管理*       |      |
| redux       | *状态管理*       |      |
| react18     | *JavaScript框架* |      |

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



# 理解

## 配置面板的属性如何传递给画布中的组件？

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



# 接口

| 接口路径                                                     | 说明               | 参数 | 响应 |
| ------------------------------------------------------------ | ------------------ | ---- | ---- |
| https://dev.appsmith.com/api/v1/admin/env                    | 请求env配置        |      |      |
| https://dev.appsmith.com/api/v1/users                        | 请求个人信息       |      |      |
| https://dev.appsmith.com/api/v1/wxLogin/code                 | 请求微信登录二维码 |      |      |
| https://dev.appsmith.com/api/v1/plugins?workspaceId=64bfd3bfcc55337d325c4380 | 请求数据源列表     |      |      |
|                                                              |                    |      |      |



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

# 路由

| 路由                                                         | 页面                        | 入口                                            | 区域                                                         |
| ------------------------------------------------------------ | --------------------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| /setup/welcome                                               | 欢迎页                      | src\pages\setup\index.tsx                       |                                                              |
| /applications                                                | 首页                        | app\client\src\ce\pages\Applications\index.tsx  |                                                              |
| /settings/${xxx}                                             | 管理员设置，general是通用栏 | app\client\src\ce\pages\AdminSettings\index.tsx | （左）侧边栏app\client\src\ce\pages\AdminSettings\LeftPane.tsx<br />（右）详细配置app\client\src\ce\pages\AdminSettings\Main.tsx |
| /profile                                                     | 个人信息                    | src\pages\UserProfile\index.tsx                 |                                                              |
| /app/1/page1-6523de68897f404778e147cd/edit<br />动态路由<br />/app/:applicationSlug/:pageSlug(.*\-):pageId/edit | 工作区                      | app\client\src\pages\Editor\loader.tsx          | （左）侧边栏-app\client\src\components\editorComponents\Sidebar.tsx<br />顶部导航-app\client\src\components\editorComponents\Sidebar.tsx<br />（右）属性配置-app\client\src\pages\Editor\PropertyPane\index.tsx |
| /user/login                                                  | 登录页                      | app\client\src\pages\UserAuth\index.tsx         |                                                              |





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

# 改动区

欢迎页-去掉图片；

登录页-UI、其他方式登录；

首页-屏蔽部分入口；

开发区-组件分类



