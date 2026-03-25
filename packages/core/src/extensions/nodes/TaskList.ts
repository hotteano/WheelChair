import { Node, mergeAttributes } from '@tiptap/core';
import { ToolbarButton } from '../../types';

export interface TaskListOptions {
  itemTypeName: string;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    taskList: {
      /**
       * Toggle a task list
       */
      toggleTaskList: () => ReturnType;
    };
  }
}

export const TaskList = Node.create<TaskListOptions>({
  name: 'taskList',

  addOptions() {
    return {
      itemTypeName: 'taskItem',
      HTMLAttributes: {},
    };
  },

  group: 'block list',

  content() {
    return `${this.options.itemTypeName}+`;
  },

  parseHTML() {
    return [
      {
        tag: `ul[data-type="${this.name}"]`,
        priority: 51,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'ul',
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          'data-type': this.name,
          class: 'task-list',
        },
      ),
      0,
    ];
  },

  addCommands() {
    return {
      toggleTaskList: () => ({ commands }) => {
        return commands.toggleList(this.name, this.options.itemTypeName);
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-t': () => this.editor.commands.toggleTaskList(),
    };
  },

  addNodeView() {
    return ({ HTMLAttributes }) => {
      const dom = document.createElement('ul');
      const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': this.name,
        class: 'task-list',
      });

      Object.entries(attrs).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          dom.setAttribute(key, String(value));
        }
      });

      return {
        dom,
        contentDOM: dom,
      };
    };
  },

  renderToolbarButton(): ToolbarButton {
    return {
      name: this.name,
      title: '任务列表',
      icon: 'task-list',
      action: () => this.editor.commands.toggleTaskList(),
      isActive: () => this.editor.isActive(this.name),
      shortcut: 'Ctrl+Shift+T',
    };
  },
});

// TaskItem extension
export interface TaskItemOptions {
  nested: boolean;
  HTMLAttributes: Record<string, any>;
}

export interface TaskItemAttributes {
  checked: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    taskItem: {
      /**
       * Toggle task item checked state
       */
      toggleTaskItem: (checked?: boolean) => ReturnType;
    };
  }
}

export const TaskItem = Node.create<TaskItemOptions>({
  name: 'taskItem',

  addOptions() {
    return {
      nested: false,
      HTMLAttributes: {},
    };
  },

  content() {
    return this.options.nested ? 'paragraph block*' : 'paragraph';
  },

  defining: true,

  addAttributes() {
    return {
      checked: {
        default: false,
        keepOnSplit: false,
        parseHTML: (element) => element.getAttribute('data-checked') === 'true',
        renderHTML: (attributes) => ({
          'data-checked': attributes.checked,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `li[data-type="${this.name}"]`,
        priority: 51,
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'li',
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          'data-type': this.name,
          class: 'task-item',
        },
      ),
      [
        'label',
        [
          'input',
          {
            type: 'checkbox',
            checked: node.attrs.checked ? 'checked' : undefined,
          },
        ],
        ['span', {}, ''],
      ],
      ['div', {}, 0],
    ];
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        // Custom behavior for task items
        const { selection } = this.editor.state;
        const { $from } = selection;
        
        if ($from.parent.type.name !== this.name) {
          return false;
        }

        // If task item is empty, lift it
        if ($from.parent.textContent === '') {
          return this.editor.chain().liftListItem('taskItem').run();
        }

        // Otherwise split and create new task item
        return this.editor.chain().splitListItem('taskItem').run();
      },
      Tab: () => this.editor.commands.sinkListItem(),
      'Shift-Tab': () => this.editor.commands.liftListItem(),
    };
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const dom = document.createElement('li');
      const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': this.name,
        class: 'task-item',
      });

      Object.entries(attrs).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          dom.setAttribute(key, String(value));
        }
      });

      // Create checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = node.attrs.checked;
      checkbox.addEventListener('change', () => {
        const { checked } = checkbox;
        editor.chain().focus().command(({ tr }) => {
          const position = getPos();
          if (typeof position === 'number') {
            tr.setNodeMarkup(position, undefined, {
              ...node.attrs,
              checked,
            });
          }
          return true;
        }).run();
      });

      // Create content container
      const content = document.createElement('div');
      content.classList.add('task-item-content');
      if (node.attrs.checked) {
        content.classList.add('is-checked');
      }

      dom.appendChild(checkbox);
      dom.appendChild(content);

      return {
        dom,
        contentDOM: content,
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) {
            return false;
          }
          
          checkbox.checked = updatedNode.attrs.checked;
          if (updatedNode.attrs.checked) {
            content.classList.add('is-checked');
          } else {
            content.classList.remove('is-checked');
          }
          
          return true;
        },
      };
    };
  },

  renderToolbarButton(): ToolbarButton {
    return {
      name: this.name,
      title: '任务项',
      icon: 'task-item',
      action: () => true,
      isActive: () => this.editor.isActive(this.name),
      disabled: true,
    };
  },
});

export default TaskList;
