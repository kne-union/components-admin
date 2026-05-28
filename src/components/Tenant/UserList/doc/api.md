### UserList

租户用户列表组件，集成筛选、分页、操作按钮等功能，支持通过 `plugins.tenantAdmin` 插件扩展列表列、表单字段和 PersonalCard 展示。

|| 属性名 | 说明 | 类型 | 默认值 ||
|| --- | --- | --- | --- ||
|| apis | API 接口配置对象 | object | - ||
|| apis.list | 用户列表接口 | object | - ||
|| apis.create | 创建用户接口，为 falsy 时隐藏创建按钮 | object | - ||
|| apis.save | 保存用户接口，为 falsy 时隐藏编辑/状态切换 | object | - ||
|| apis.remove | 删除用户接口，为 falsy 时隐藏删除按钮 | object | - ||
|| apis.setStatus | 切换用户状态接口 | object | - ||
|| apis.inviteToken | 获取邀请链接接口 | object | - ||
|| apis.userInviteMessage | 发送邀请邮件接口 | object | - ||
|| apis.roleList | 角色列表接口 | object | - ||
|| apis.orgList | 组织列表接口 | object | - ||
|| topOptionsSize | 顶部操作按钮尺寸 | string | - ||
|| onMount | 组件挂载回调，接收 `{ filter, filterList, topOptions, tableOptions }` | function | - ||
|| children | 自定义渲染函数，接收与 onMount 相同的参数 | function | - ||
|| initialTenantOrgId | 初始选中的组织 ID | string | - ||
|| initialOrgName | 初始选中的组织名称 | string | - ||
|| initialUserId | 初始筛选的用户 ID | string | - ||
|| allowQueryIdForUserFilter | 是否允许通过 URL `id` 参数筛选用户 | boolean | false |

### UserCard

用户信息卡片组件，用于展示用户基本信息。

|| 属性名 | 说明 | 类型 | 默认值 ||
|| --- | --- | --- | --- ||
|| data | 用户数据对象 | object | - ||

### TenantUserPersonalCard

用户个人卡片组件，用于邀请弹窗、加入确认等场景。

|| 属性名 | 说明 | 类型 | 默认值 ||
|| --- | --- | --- | --- ||
|| data | 用户数据对象 | object | - ||
|| className | 自定义样式类名 | string | - |

#### 插件扩展点

通过 `plugins.tenantAdmin` 在 preset 中注册插件，可扩展用户属性展示。

##### UserFormInner

替换用户创建/编辑表单组件，接收 `{ list, apis, column }` 属性，`list` 为默认表单字段列表，可插入自定义字段。

```javascript
// 注册方式：在 preset 的 plugins.tenantAdmin.UserFormInner 中配置
plugins: {
  tenantAdmin: {
    UserFormInner: YourFormComponent
  }
}
```

##### getUserListColumns

扩展用户列表表格列，接收 `{ columns, apis }`，返回新的列配置数组。

```javascript
plugins: {
  tenantAdmin: {
    getUserListColumns: ({ columns, apis }) => {
      const newColumns = columns.slice(0);
      newColumns.splice(7, 0, { title: '岗位', name: 'options.position', type: 'other' });
      return newColumns;
    }
  }
}
```

##### personalCard

增强 PersonalCard 的 moreInfo 展示，接收 `{ moreInfo, data, formatMessage, plugins }`，返回增强后的 moreInfo 数组。

```javascript
plugins: {
  tenantAdmin: {
    personalCard: ({ moreInfo, data, formatMessage }) => {
      return [...moreInfo, { key: 'position', label: '岗位', content: data.options?.position }];
    }
  }
}
```

##### getUserApis

提供额外的 API 端点（如岗位列表），接收 `{ tenantId, apis }`，返回需要合并到 UserList apis 中的对象。

```javascript
plugins: {
  tenantAdmin: {
    getUserApis: ({ tenantId, apis }) => ({
      positionList: apis.talentSaas?.tenantAdmin?.position?.list,
      list: apis.talentSaas?.tenantAdmin?.userList
    })
  }
}
```
