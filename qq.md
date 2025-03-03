# 多图层手势架构设计与实现

## 1. 背景与问题

在多图层编辑应用中，常见的架构问题：

- 手势和渲染逻辑混合在一起，难以维护
- 多图层间手势冲突，难以独立控制
- 状态管理复杂，影响性能
- 代码耦合度高，难以扩展新功能

参考 `stickerDemo` 示例，我们可以采用渲染层和手势层分离的架构设计来解决这些问题。

## 2. 架构核心思想

### 2.1 分离关注点

新架构的核心是严格区分三个关注点：

1. **渲染层**：只负责显示内容，不处理任何交互
2. **手势层**：只负责处理用户交互，不直接渲染内容
3. **状态层**：集中管理所有图层数据，连接渲染和手势

### 2.2 架构图

我们继续讨论并帮助我学习项目吧。接下来我们看看系统的手势+图层联合开发有没有问题呢？

<think>
你想要继续讨论项目，特别是关于手势系统和图层管理的结合开发。我们之前已经详细讨论了共享值(SharedValue)、Zustand状态管理以及手势系统的原理。现在你想了解如何将这些技术结合起来，特别是手势与图层操作的联动。
我需要从以下几个方面进行解析：
手势与图层的联动机制
可能存在的问题点
优化建议和最佳实践
让我基于之前的讨论和常见的React Native图层编辑器架构来提供一个全面的分析。
</think>
让我们继续深入讨论手势系统与图层管理的结合开发。这确实是图像编辑应用中最关键的部分。
手势与图层联动机制
1. 当前系统的联动流程
基于之前看到的代码，目前的手势与图层联动流程大致如下：
2. 潜在问题分析
图层选择与手势状态不同步
多图层手势互相干扰
手势与状态更新频率不匹配
优化建议
1. 图层初始状态同步
2. 增强手势与图层的绑定
3. 多图层手势协调
高级特性建议
1. 图层变换历史记录
2. 智能对齐与吸附
3. 组合变换模式
现有系统看起来基础功能已经实现，但可能需要考虑更复杂的图层交互场景。你想深入讨论其中的某个方面吗？或者有其他关于项目架构的问题？
多图层的话，该如何保证图层渲染和手势交互互不影响呢？不同图层的不同手势该如何对应实现互不影响？

<think>
这是一个很好的问题，涉及到多图层应用中的手势管理和渲染优化。让我思考一下最佳解决方案。
在多图层系统中，主要挑战包括：
手势隔离 - 确保一个图层的手势不会干扰其他图层
渲染优化 - 确保只有需要更新的图层才重新渲染
选择与交互 - 如何确定哪个图层接收手势
性能考虑 - 如何保持高性能
首先我需要分析多图层手势管理的几种可能方案：
集中式手势管理：只有活动/选中图层接收手势
分布式手势管理：每个图层有自己的手势处理
代理式手势管理：一个中央系统决定哪个图层应该响应手势
我应该提供全面的建议，包括代码示例和架构设计。
</think>
多图层手势与渲染独立管理
这是一个非常重要的问题。多图层系统中确保手势和渲染互不干扰是保证良好用户体验的关键。
图层手势隔离策略
1. 采用分层手势系统
2. 集中式图层状态管理
渲染优化策略
1. 渲染隔离
2. 图层内容隔离渲染
手势冲突解决
1. 手势优先级系统
2. 使用手势遮罩层
完整的多图层管理方案
通过这种架构，你可以实现多图层系统中的每个图层独立响应手势，互不干扰，同时优化渲染性能。关键点是：
每个图层拥有自己独立的共享值和手势系统
使用 memo 优化渲染，避免不必要的更新
通过手势优先级解决冲突
正确同步图层状态和共享值
分离手势和渲染逻辑
这种设计可以保证在复杂的多图层系统中保持良好的性能和用户体验。
@stickerDemo 你看看这个sticker的示例，是否就是你提到的方案？

<think>
让我分析一下这个 stickerDemo 代码，看看它是如何实现多图层手势管理的：
整体架构:
使用 Canvas 作为渲染层
分离图层内容和手势处理
使用矩阵变换来处理贴纸的位置、缩放和旋转
核心组件:
Canvas - 用于渲染所有内容
Image - 背景图片
Sticker - 贴纸组件
GestureHandler - 手势处理组件
状态管理:
useStickerContext - 用于管理贴纸的状态
每个贴纸都有自己的矩阵变换和尺寸
4. 关键实现细节:
渲染层: 在 Canvas 中渲染背景图片和所有贴纸
手势层: 为每个贴纸创建单独的 GestureHandler
贴纸状态: 包含 Sticker 组件、矩阵和尺寸
这个例子确实采用了我提到的分离手势和渲染的方案。它通过以下方式解决多图层手势互不干扰的问题:
每个贴纸都有自己的 GestureHandler
手势处理和渲染是分离的
使用矩阵变换来管理贴纸的变换状态
这与我之前建议的架构非常相似，尤其是在分离手势和渲染方面。不过，这个示例没有显示如何处理选择/取消选择贴纸的逻辑，以及如何处理手势优先级的问题。
</think>
是的，这个 stickerDemo 示例确实采用了类似我提到的方案！这是一个很好的参考实现，展示了如何处理多图层手势系统。让我来分析关键部分：
1. 分离渲染层和手势层
这正是我建议的关键策略：
渲染层负责显示内容
手势层负责处理交互
两者通过共享状态（这里是 matrix）连接
2. 独立的手势处理器
每个贴纸拥有自己的 GestureHandler，这确保了:
手势互不干扰
可以独立操作每个贴纸
避免手势冲突
虽然没有看到 GestureHandler 的实现，但它很可能是这样的结构:
3. 共享状态
示例使用了 Context API 来共享状态:
这允许:
集中管理所有贴纸
在渲染层和手势层之间共享状态
容易扩展更多功能
4. 矩阵变换
使用矩阵来管理变换是一个很好的做法:
可以在一个对象中包含所有变换信息 (位置、缩放、旋转)
高效处理复杂变换
与 Skia 渲染系统无缝集成
优势总结
这个示例展示了几个关键优势:
渲染与手势分离 - 更好的关注点分离
独立的手势处理 - 避免手势冲突
统一的状态管理 - 保持数据一致性
高效的矩阵变换 - 优化性能
这种架构非常适合多图层编辑应用，你可以在你的项目中采用类似的方法。不过，你可能还需要添加:
选择/取消选择图层的逻辑
图层优先级管理
更复杂的交互行为 (如旋转控制点)
这个示例是一个很好的起点，证明了我之前建议的方案是实用且有效的。
可以，要实现这种手势处理架构，当前系统需要修改图层或者手势架构吗？

<think>
我需要分析是否需要修改当前系统的图层或手势架构来实现类似 stickerDemo 示例中的处理方式。
首先，回顾一下 stickerDemo 的关键架构特点：
分离渲染层和手势层
每个贴纸有独立的手势处理器
使用共享状态（matrix）
矩阵变换处理
现在，我需要考虑当前系统的架构，基于之前看到的代码和讨论:
CanvasView.tsx - 主画布组件
useCanvasGestures.ts - 手势处理钩子
图层系统 - 使用 Zustand 管理
在当前系统中，可能存在的架构:
一个集中的手势处理系统，而不是每个图层独立
渲染和手势可能是混合在一起的
可能没有为每个图层单独创建手势处理器
需要考虑的修改:
可能需要将手势系统从集中式改为分布式
可能需要分离渲染和手势层
可能需要修改状态管理方式
让我给出具体的建议。
</think>
当前系统架构修改建议
基于之前的讨论和 stickerDemo 的实现方式，我建议进行以下架构调整：
1. 当前架构分析
目前的架构可能是这样的：
单一的手势系统处理所有图层
渲染和手势处理可能混合在一起
使用 Zustand 管理图层状态
useCanvasGestures 可能是集中式的手势处理
2. 需要修改的部分
图层架构修改
推荐的新架构
3. 具体实现变更
新增：独立图层手势处理器
修改：图层渲染器
4. 状态管理调整
不需要大幅修改 Zustand store，但可能需要添加一些辅助方法：
5. 迁移建议
逐步实施:
首先创建 LayerGestureHandler 组件
然后分离渲染和手势层
最后调整 LayerRenderer
保持兼容性:
在迁移期间保留旧的手势系统
在确认新系统稳定后才移除旧系统
测试策略:
为每个图层类型单独测试手势
测试多图层同时存在的情况
检查性能表现
这些修改将帮助你实现类似 stickerDemo 的分离式手势架构，同时保持当前系统的核心功能。主要改变是从集中式手势处理转向每个图层独立的手势处理，并明确分离渲染层和交互层。
@app 好的，接下来我们开始按照你的建议进行架构迁移吧，这是源文件的文件夹

<think>
我需要分析当前的项目结构，并提出如何实现手势系统的迁移。基于提供的文件和之前的讨论，我将分析现有结构，并提出具体的迁移步骤。
当前项目结构分析：
文件夹结构:
app/features/canvas/layers - 包含图层渲染相关组件
app/features/canvas/draw - 绘图相关功能
app/features/canvas/decoration - 装饰图层相关
重要文件:
LayerRenderer.tsx - 负责渲染图层
LayerFactory.tsx - 图层工厂，创建不同类型的图层渲染器
BaseRenderer.tsx - 基础渲染器组件
各种图层渲染器 (ImageLayerRenderer, TextLayerRenderer, DrawLayerRenderer)
当前手势实现:
DrawLayerRenderer.tsx 中有独立的手势处理，但不是完整的分离架构
似乎还没有完全实现分离的手势系统
需要实现的关键组件:
LayerGestureHandler - 每个图层的独立手势处理器
修改当前的渲染系统，将渲染与手势分离
我会提出一个详细的迁移计划，包括新建文件和修改现有文件。
</think>
多图层手势系统实现计划
基于我们的讨论和stickerDemo示例，我看到了当前项目的结构，现在提出一个具体的实施计划来迁移到分离的手势架构。
1. 当前架构的问题
从现有文件可以看出：
目前的渲染器 (ImageLayerRenderer, TextLayerRenderer 等) 混合了渲染和变换逻辑
DrawLayerRenderer 中尝试直接在渲染组件中添加手势，这会导致问题
缺少独立的手势处理层
没有明确分离的渲染和交互关注点
2. 实施计划
步骤 1: 创建专用的手势处理器组件
首先，我们需要创建一个新的目录和文件：
步骤 2: 创建手势管理组件
步骤 3: 修改 CanvasView 集成手势层
现在需要修改主要的 CanvasView 组件，添加新的手势层：
步骤 4: 简化图层渲染器，移除手势逻辑
现在我们需要简化现有的图层渲染器，移除其中的手势和变换逻辑：
步骤 5: 修改 ImageLayerRenderer 简化逻辑
步骤 6: 更新 DrawLayerRenderer 移除内部手势
步骤 7: 更新 useLayerStore 添加必要的辅助方法
如果需要，可以增强 useLayerStore 以更好地支持手势操作：
3. 迁移步骤
首先创建新的手势处理组件，但不要立即集成到主视图
确保手势处理器可以正确更新图层状态
逐步简化现有渲染器，移除手势逻辑
最后将手势层添加到主视图
这种渐进式迁移可以确保在过程中应用仍然可用，并且可以随时回滚如果出现问题。
4. 预期结果
完成这些更改后，你的应用将具有:
清晰分离的关注点:
渲染层只负责显示
手势层只负责交互
状态层处理数据
独立的图层手势:
每个图层有自己的手势处理
避免手势冲突
更好的用户体验
更容易维护的代码结构:
功能更清晰地分离
更容易添加新的图层类型或手势
更好的性能特性
你想从哪个部分开始实施这个计划？
请继续实施吧

<think>
我正在帮助用户实施分离式手势架构，目前已经：
创建了 LayerGestureHandler.tsx - 负责处理单个图层的手势
创建了 LayerGestureManager.tsx - 负责管理所有图层的手势
简化了 BaseRenderer.tsx - 移除了选择框相关逻辑
更新了 ImageLayerRenderer.tsx - 使用 BaseRenderer 并移除手势逻辑
更新了 DrawLayerRenderer.tsx - 使用 BaseRenderer 并移除手势逻辑
但用户的 CanvasView.tsx 文件似乎没有成功更新。我需要让用户更新主 CanvasView 组件以集成新的手势层。
现在我需要：
解释当前进展
重点关注 CanvasView.tsx 的更新
提供完整的整合步骤
</think>
手势架构实施进展
很好！我们已经成功创建和更新了多个组件：
✅ 创建了 LayerGestureHandler - 为每个图层提供独立的手势处理
✅ 创建了 LayerGestureManager - 管理所有图层的手势
✅ 更新了 BaseRenderer - 移除选择框，保留纯渲染逻辑
✅ 更新了 ImageLayerRenderer - 使用简化的 BaseRenderer
✅ 更新了 DrawLayerRenderer - 移除内部手势，使用 BaseRenderer
现在我们需要更新 CanvasView.tsx 来集成这个新架构，但似乎上次的编辑没有成功应用。
重点：更新 CanvasView.tsx
让我们再次尝试更新 CanvasView.tsx 文件：
完成架构迁移的下一步
接下来，我们需要：
修复 LayerGestureHandler 中的类型错误：
layer.width 和 layer.height 可能在 Layer 类型中不存在，需要更新
如果 Layer 接口没有这些属性，我们需要根据图层类型来动态计算尺寸
2. 处理 Layer 类型缺失属性：
需要确保每种图层类型都有合适的尺寸计算方法
或者修改 Layer 接口以包含这些属性
确认 GestureHandler 可见性：
确保手势层能正确处理点击和交互
可能需要调整图层大小和位置
测试基本功能：
确认图层选择功能正常工作
确认移动/缩放/旋转手势正常工作
确认状态正确更新到 store
LayerGestureHandler 类型修复
我们需要解决 LayerGestureHandler.tsx 中的类型错误。可以这样更新：
请问是否准备好进行这些修改？或者有其他问题需要解决？
请继续

<think>
我们需要继续完成CanvasView的修改以及解决当前文件中的问题。在LayerGestureHandler.tsx中，我看到有一个未定义的函数calculateFitSize，我们需要导入这个函数。同时，CanvasView.tsx文件还没有被修改。
下一步应该做的：
导入calculateFitSize函数到LayerGestureHandler.tsx
重新尝试修改CanvasView.tsx以集成新的手势架构
继续检查是否有其他需要调整的地方
让我处理这些问题：
</think>
继续手势架构实施
我们需要处理两个重要问题：
在 LayerGestureHandler.tsx 中缺少 calculateFitSize 函数
CanvasView.tsx 文件尚未更新为新架构
1. 首先，让我们修复 LayerGestureHandler.tsx
2. 更新 CanvasView.tsx
现在，让我们更新主要的 CanvasView 组件：
3. 完成架构迁移之后的测试和调整
一旦完成上述更改，我们需要进行以下测试和调整：
基础功能测试：
图层选择测试：
点击图层是否能正确选中
选中状态是否正确显示（边框等）
手势操作测试：
移动图层是否正常工作
缩放和旋转是否正确响应
手势结束后状态是否正确保存
多图层交互测试：
多个图层是否能正确独立响应手势
图层间手势是否互不干扰
可能的调整：
手势识别区域：
如果发现手势响应区域不准确，可能需要调整手势处理器的尺寸计算逻辑
视觉反馈：
可以考虑在手势过程中添加额外的视觉反馈（如操作手柄、变换提示等）
3. 性能优化：
如果在移动多个复杂图层时出现性能问题，可以考虑添加渲染优化策略
架构优势：
这种分离的架构带来几个关键优势：
关注点分离：渲染逻辑和交互逻辑完全独立，更易维护
更好的性能：Canvas 渲染和手势处理可以分别优化
灵活的扩展性：可以轻松添加新的图层类型或手势交互
避免手势冲突：每个图层的手势独立处理
是否需要我接下来提供这些文件的完整代码？或者您有其他需要解决的问题？
请修改给出完整代码

<think>
我需要提供 app/features/canvas/CanvasView.tsx 的完整代码，因为之前的编辑没有成功。这个文件是新架构的关键组件，需要集成渲染层和手势层。
同时，我注意到 app/features/canvas/gestures/LayerGestureHandler.tsx 文件内容不完整，只显示了部分代码。最好也提供这个文件的完整内容，确保所有必要的导入和函数都正确实现。
</think>
完整代码实现
让我提供完整的 CanvasView.tsx 和 LayerGestureHandler.tsx 代码：
1. 首先是 CanvasView.tsx：
2. 完整的 LayerGestureHandler.tsx：
这两个文件是新架构的核心组件，实现了渲染和手势分离的设计模式。其中：
CanvasView 负责整体布局，包含渲染层和手势层
LayerGestureHandler 为每个图层提供独立的手势处理，通过共享值和动画样式实现交互
这种架构带来的优势：
清晰的关注点分离
每个图层独立的手势处理
渲染和交互的解耦
更好的性能和可维护性
一旦这些文件更新完成，您应该可以测试基本功能，如图层选择和变换操作，确保新架构正常工作。
@LayerGestureHandler 有一些报错import { TextLayer } from "../../../types/textLayer";
没有这些Layer，这是什么Layer？我已经有ImageLayerRenderer了，而且render使用了图层注册

<think>
看起来有一些导入错误，特别是关于 TextLayer 和 ImageLayer 类型。这可能是因为项目结构与我假设的不同。
根据您的描述，您已经有了 ImageLayerRenderer，而且您的系统使用了图层注册机制。这意味着您的图层类型可能统一定义在一个地方，而不是分散在多个文件中。
我们需要查看项目当前的图层类型定义，然后根据现有的类型结构来调整 LayerGestureHandler 组件。可能需要：
检查是否有一个统一的 Layer 类型定义
确认 Layer 类型中是否包含 type 字段和必要的属性
调整导入，使用正确的类型定义
根据您提到的 "我已经有ImageLayerRenderer了"，可能的解决方案是从现有的渲染器中推断正确的类型导入。
</think>
修复 LayerGestureHandler 的类型导入问题
看来 LayerGestureHandler.tsx 中存在类型导入错误。这些错误是因为我们引用了不存在的模块。让我们修复这个问题：
分析问题
您提到的错误是关于 import { TextLayer } from "../../../types/textLayer"; 和 import { ImageLayer } from "../../../types/imageLayer"; 这两个导入，但这些模块在您的项目中不存在。
解决方案
根据您提到已有 ImageLayerRenderer 和图层注册系统，我们需要将类型导入调整为项目中实际存在的类型。
更好的长期解决方案
为了更好地解决类型问题，建议您：
检查项目中的图层类型定义：
查找 Layer 接口定义
了解图层类型的扩展方式
创建或更新正确的类型定义：
使用类型守卫：
这样可以确保类型安全性，同时避免使用 as 断言。
关于 CanvasView.tsx 文件，请确认您想要进行的更改。在您的回应中，它显示为"file was not changed"，所以可能需要重新尝试编辑该文件以完成架构迁移。
先别急着开发，这样吧，请你将我们讨论的图层和手势相关的新架构实现思想和步骤详细的记录在根目录下的qq.md中吧

<think>
好的，我需要创建一个名为 qq.md 的文件，详细记录我们讨论的图层和手势相关的新架构实现思想和步骤。我将包含以下内容：
问题背景和痛点
新架构的核心思想
架构设计原则
实施步骤详解
关键组件说明
代码示例
注意事项
未来优化方向
这个文档将帮助团队理解新架构的设计理念和实施方法。
</think>
创建文档
好的，我会创建一个详细说明多图层手势架构的文档。将为您创建 qq.md 文件，记录我们讨论的图层和手势分离架构的实现思想和步骤。
┌─────────────────────────────────────────┐
│ 应用容器 │
├─────────────────┬───────────────────────┤
│ │ │
│ Canvas (渲染层) │ GestureLayer (手势层) │
│ │ │
└─────────┬───────┴───────────┬───────────┘
│ │
▼ ▼
┌─────────────────┐ ┌─────────────────────┐
│ │ │ │
│ LayerRenderer │ │ LayerGestureHandler │
│ │ │ │
└─────────┬───────┘ └──────────┬──────────┘
│ │
│ ┌───────────┘
│ │
▼ ▼
┌─────────────────────────┐
│ │
│ LayerStore │
│ (Zustand 状态管理) │
│ │
└─────────────────────────┘
### 2.3 数据流

1. 用户与手势层交互
2. 手势层更新状态层中的数据
3. 渲染层订阅状态变化并更新视图

## 3. 组件设计

### 3.1 渲染层组件

#### CanvasView

容器组件，包含渲染层和手势层：
jsx
<View style={styles.container}>
{/ 渲染层 - 只负责显示 /}
<Canvas style={styles.canvas}>
<Group>
<GuideLines />
<LayerRenderer />
</Group>
</Canvas>
{/ 手势层 - 只负责交互 /}
<LayerGestureManager />
</View>

#### LayerRenderer

负责渲染所有图层，不处理任何交互：
jsx
const LayerRenderer = () => {
const layers = useLayerStore((state) => state.layers);
const sortedLayers = Array.from(layers.values()).sort(
(a, b) => a.zIndex - b.zIndex
);
return (
<Group>
{sortedLayers.map((layer) => (
<LayerFactory key={layer.id} layer={layer} />
))}
</Group>
);
};

### 3.2 手势层组件

#### LayerGestureManager

管理所有图层的手势处理器：
jsx
const LayerGestureManager = () => {
const layers = useLayerStore((state) => Array.from(state.layers.values()));
return (
<View style={StyleSheet.absoluteFill}>
{layers.map((layer) => (
<LayerGestureHandler key={layer.id} layer={layer} />
))}
</View>
);
};

#### LayerGestureHandler

为每个图层提供独立的手势处理：
jsx
const LayerGestureHandler = ({ layer }) => {
// 共享值
const position = useSharedValue(layer.transform.position);
const scale = useSharedValue(layer.transform.scale);
const rotation = useSharedValue(layer.transform.rotation);
// 手势处理
const gesture = Gesture.Simultaneous(
Gesture.Pan().onUpdate(...),
Gesture.Pinch().onUpdate(...),
Gesture.Rotation().onUpdate(...)
);
// 动画样式
const animatedStyle = useAnimatedStyle(() => ({
position: 'absolute',
transform: [
{ translateX: position.value.x },
{ translateY: position.value.y },
{ scale: scale.value },
{ rotate: ${rotation.value}rad },
],
width: layer.width,
height: layer.height,
}));
return (
<GestureDetector gesture={gesture}>
<Animated.View style={animatedStyle} />
</GestureDetector>
);
};

### 3.3 状态管理

使用 Zustand 进行状态管理：
jsx
const useLayerStore = create((set) => ({
layers: new Map(),
selectedLayerId: null,
addLayer: (layer) => set((state) => {
const newLayers = new Map(state.layers);
newLayers.set(layer.id, layer);
return { layers: newLayers };
}),
updateLayer: (id, updates) => set((state) => {
const newLayers = new Map(state.layers);
const layer = newLayers.get(id);
if (layer) {
newLayers.set(id, { ...layer, ...updates });
}
return { layers: newLayers };
}),
selectLayer: (id) => set({ selectedLayerId: id }),
}));

## 4. 实施步骤

### 4.1 准备工作

1. 确认项目结构
2. 明确图层类型定义
3. 设置状态管理

### 4.2 实施流程

#### 第一阶段：创建手势处理组件

1. 创建 `LayerGestureHandler.tsx`

   - 实现独立的图层手势处理
   - 使用共享值管理变换状态

2. 创建 `LayerGestureManager.tsx`
   - 管理所有图层的手势处理器

#### 第二阶段：简化渲染组件

1. 修改 `BaseRenderer.tsx`

   - 移除手势逻辑，保留纯渲染功能

2. 更新 `ImageLayerRenderer.tsx` 和其他渲染器
   - 使用 BaseRenderer 简化实现
   - 移除内部手势处理

#### 第三阶段：集成新架构

1. 更新 `CanvasView.tsx`

   - 将渲染层和手势层组合在一起

2. 测试基本功能
   - 图层选择
   - 图层变换（移动、缩放、旋转）

### 4.3 可能遇到的问题与解决方案

1. **类型定义问题**

   - 解决方案：使用类型守卫或正确的类型断言

2. **手势响应区域不准确**

   - 解决方案：动态计算图层尺寸，调整手势层的大小

3. **性能问题**
   - 解决方案：使用 memoization，避免不必要的重渲染

## 5. 架构优势

1. **关注点分离**

   - 渲染与交互解耦
   - 代码职责更清晰

2. **独立的图层手势**

   - 避免手势冲突
   - 更好的用户体验

3. **性能优化**

   - 减少不必要的渲染
   - 更高效的状态更新

4. **可扩展性**
   - 容易添加新的图层类型
   - 灵活的手势定制

## 6. 未来优化方向

1. **高级手势控制**

   - 添加旋转控制点
   - 实现边框拖拽调整大小

2. **选择与多选**

   - 实现多图层同时选择
   - 批量变换操作

3. **撤销/重做功能**

   - 基于状态变更记录
   - 时间旅行功能

4. **性能优化**
   - 大型场景的图层管理策略
   - 图层懒加载与卸载

## 7. 参考资源

1. stickerDemo 示例
2. React Native Gesture Handler 文档
3. React Native Reanimated 文档
4. Zustand 状态管理文档
