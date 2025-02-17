# PhotoPixel 项目管理系统实现文档

## 1. 系统架构

### 1.1 核心功能模块

- 项目管理：创建、保存、加载项目
- 版本控制：管理项目版本和历史记录
- 自动保存：定期保存项目状态
- 模板系统：管理和使用项目模板

### 1.2 基础数据结构

```typescript
// 项目定义
interface Project {
  id: string;
  name: string;
  createdAt: number;
  lastModified: number;
  metadata: ProjectMetadata;
  state: ProjectState;
  version: string;
  thumbnail?: string;
}

// 项目元数据
interface ProjectMetadata {
  author?: string;
  description?: string;
  tags: string[];
  dimensions: {
    width: number;
    height: number;
  };
  format: string;
  size: number;
}

// 项目状态
interface ProjectState {
  layers: Layer[];
  history: HistoryState;
  resources: ResourceState;
  settings: ProjectSettings;
}

// 项目版本
interface ProjectVersion {
  id: string;
  projectId: string;
  version: string;
  timestamp: number;
  state: ProjectState;
  thumbnail?: string;
  comment?: string;
}

// 项目模板
interface ProjectTemplate {
  id: string;
  name: string;
  thumbnail: string;
  metadata: ProjectMetadata;
  defaultState: Partial<ProjectState>;
  category: string;
}
```

## 2. 核心功能实现

### 2.1 项目管理器

```typescript
class ProjectManager {
  private currentProject: Project | null = null;
  private autoSaveInterval: number = 5 * 60 * 1000; // 5分钟
  private isAutoSaving: boolean = false;

  // 创建新项目
  async createProject(options: CreateProjectOptions): Promise<Project> {
    const project: Project = {
      id: generateId(),
      name: options.name,
      createdAt: Date.now(),
      lastModified: Date.now(),
      metadata: {
        dimensions: options.dimensions,
        format: options.format,
        tags: [],
        size: 0,
      },
      state: this.createInitialState(options),
      version: '1.0.0',
    };

    // 生成缩略图
    if (options.content) {
      project.thumbnail = await this.generateThumbnail(options.content);
    }

    // 保存项目
    await this.saveProject(project);
    this.currentProject = project;

    // 启动自动保存
    this.startAutoSave();

    return project;
  }

  // 保存项目
  async saveProject(project: Project): Promise<void> {
    try {
      // 更新元数据
      project.lastModified = Date.now();
      project.metadata.size = this.calculateProjectSize(project);

      // 保存到存储
      await this.storage.saveProject(project);

      // 创建新版本
      await this.versionManager.createVersion(project);

      // 触发保存事件
      this.emitProjectSaved(project);
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  }

  // 加载项目
  async loadProject(id: string): Promise<Project> {
    try {
      // 停止当前项目的自动保存
      this.stopAutoSave();

      // 加载项目数据
      const project = await this.storage.loadProject(id);
      this.currentProject = project;

      // 加载项目资源
      await this.resourceManager.loadProjectResources(project);

      // 启动自动保存
      this.startAutoSave();

      return project;
    } catch (error) {
      console.error('Failed to load project:', error);
      throw error;
    }
  }

  // 自动保存
  private startAutoSave(): void {
    if (this.isAutoSaving) return;

    this.isAutoSaving = true;
    this.autoSaveInterval = setInterval(async () => {
      if (this.currentProject && this.hasUnsavedChanges()) {
        try {
          await this.saveProject(this.currentProject);
        } catch (error) {
          console.error('Auto save failed:', error);
        }
      }
    }, this.autoSaveInterval);
  }
}
```

### 2.2 版本管理器

```typescript
class VersionManager {
  private versions: Map<string, ProjectVersion[]> = new Map();
  private maxVersionsPerProject: number = 50;

  // 创建版本
  async createVersion(
    project: Project,
    comment?: string,
  ): Promise<ProjectVersion> {
    const version: ProjectVersion = {
      id: generateId(),
      projectId: project.id,
      version: this.generateVersionNumber(project),
      timestamp: Date.now(),
      state: project.state,
      comment,
    };

    // 生成缩略图
    version.thumbnail = await this.generateVersionThumbnail(project);

    // 保存版本
    await this.saveVersion(version);

    // 管理版本数量
    await this.manageVersionCount(project.id);

    return version;
  }

  // 恢复到指定版本
  async restoreVersion(versionId: string): Promise<Project> {
    const version = await this.loadVersion(versionId);
    if (!version) throw new Error('Version not found');

    // 加载项目
    const project = await this.projectManager.loadProject(version.projectId);

    // 恢复状态
    project.state = version.state;
    project.version = version.version;
    project.lastModified = Date.now();

    // 保存更改
    await this.projectManager.saveProject(project);

    return project;
  }

  // 比较版本
  compareVersions(
    version1: ProjectVersion,
    version2: ProjectVersion,
  ): VersionDiff {
    return {
      layers: this.compareLayerStates(
        version1.state.layers,
        version2.state.layers,
      ),
      resources: this.compareResourceStates(
        version1.state.resources,
        version2.state.resources,
      ),
      settings: this.compareSettings(
        version1.state.settings,
        version2.state.settings,
      ),
    };
  }
}
```

### 2.3 模板管理器

```typescript
class TemplateManager {
  private templates: Map<string, ProjectTemplate> = new Map();

  // 创建模板
  async createTemplate(
    project: Project,
    options: CreateTemplateOptions,
  ): Promise<ProjectTemplate> {
    const template: ProjectTemplate = {
      id: generateId(),
      name: options.name,
      thumbnail: await this.generateTemplateThumbnail(project),
      metadata: {
        ...project.metadata,
        description: options.description,
      },
      defaultState: this.extractTemplateState(project.state),
      category: options.category,
    };

    // 保存模板
    await this.saveTemplate(template);

    return template;
  }

  // 从模板创建项目
  async createProjectFromTemplate(
    templateId: string,
    options: CreateProjectOptions,
  ): Promise<Project> {
    const template = await this.loadTemplate(templateId);
    if (!template) throw new Error('Template not found');

    // 创建项目
    const project = await this.projectManager.createProject({
      ...options,
      metadata: {
        ...options.metadata,
        ...template.metadata,
      },
      state: this.mergeTemplateState(template.defaultState, options.state),
    });

    return project;
  }

  // 更新模板
  async updateTemplate(
    templateId: string,
    updates: Partial<ProjectTemplate>,
  ): Promise<ProjectTemplate> {
    const template = await this.loadTemplate(templateId);
    if (!template) throw new Error('Template not found');

    // 应用更新
    Object.assign(template, updates);
    template.lastModified = Date.now();

    // 保存更改
    await this.saveTemplate(template);

    return template;
  }
}
```

## 3. 存储实现

### 3.1 项目存储

```typescript
class ProjectStorage {
  private readonly STORAGE_KEY = 'photopixel_projects';
  private readonly VERSION_KEY = 'photopixel_versions';

  // 保存项目
  async saveProject(project: Project): Promise<void> {
    try {
      // 压缩项目数据
      const compressed = await this.compressProject(project);

      // 保存到 IndexedDB
      await this.db.projects.put(compressed);

      // 更新缓存
      this.updateProjectCache(project);
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  }

  // 加载项目
  async loadProject(id: string): Promise<Project> {
    try {
      // 检查缓存
      const cached = this.getProjectFromCache(id);
      if (cached) return cached;

      // 从 IndexedDB 加载
      const compressed = await this.db.projects.get(id);
      if (!compressed) throw new Error('Project not found');

      // 解压项目数据
      const project = await this.decompressProject(compressed);

      // 更新缓存
      this.updateProjectCache(project);

      return project;
    } catch (error) {
      console.error('Failed to load project:', error);
      throw error;
    }
  }

  // 删除项目
  async deleteProject(id: string): Promise<void> {
    try {
      // 删除项目数据
      await this.db.projects.delete(id);

      // 删除相关版本
      await this.db.versions.where('projectId').equals(id).delete();

      // 清理缓存
      this.clearProjectCache(id);
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }
}
```

## 4. 用户界面集成

### 4.1 项目管理界面

```typescript
const ProjectManager: FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <View style={styles.container}>
      <ProjectList
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
      />
      <ProjectDetails project={selectedProject} />
      <ProjectActions
        project={selectedProject}
        onCreateNew={handleCreateNew}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </View>
  );
};

const ProjectList: FC<ProjectListProps> = ({
  projects,
  selectedProject,
  onSelectProject,
}) => {
  return (
    <ScrollView style={styles.projectList}>
      {projects.map(project => (
        <ProjectItem
          key={project.id}
          project={project}
          isSelected={selectedProject?.id === project.id}
          onSelect={() => onSelectProject(project)}
        />
      ))}
    </ScrollView>
  );
};
```

### 4.2 版本管理界面

```typescript
const VersionManager: FC<{project: Project}> = ({project}) => {
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ProjectVersion | null>(
    null,
  );

  return (
    <View style={styles.container}>
      <VersionList
        versions={versions}
        selectedVersion={selectedVersion}
        onSelectVersion={setSelectedVersion}
      />
      <VersionDetails version={selectedVersion} />
      <VersionActions
        version={selectedVersion}
        onRestore={handleRestore}
        onDelete={handleDelete}
      />
      <VersionDiffViewer
        currentVersion={project.version}
        selectedVersion={selectedVersion}
      />
    </View>
  );
};
```

## 5. 系统优势

1. **完整的项目管理**

   - 项目创建和模板
   - 自动保存和备份
   - 版本控制和回滚
   - 项目元数据管理

2. **可靠的存储系统**

   - 数据压缩存储
   - 缓存优化
   - 错误恢复
   - 存储空间管理

3. **灵活的版本控制**

   - 版本历史记录
   - 版本比较和回滚
   - 版本注释
   - 自动版本管理

4. **用户友好界面**
   - 项目预览
   - 版本时间线
   - 直观的操作
   - 详细的项目信息

## 6. 注意事项

1. **数据安全**

   - 自动备份
   - 数据验证
   - 错误恢复
   - 版本保护

2. **性能优化**

   - 存储优化
   - 加载性能
   - 版本管理
   - 缓存策略

3. **用户体验**

   - 保存提示
   - 加载反馈
   - 版本提示
   - 错误处理

4. **存储管理**
   - 空间管理
   - 清理策略
   - 压缩优化
   - 备份策略
