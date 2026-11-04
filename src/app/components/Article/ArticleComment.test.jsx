import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ArticleComment from './ArticleComment';

const comment = {
  id: 10,
  article_id: 1,
  parent_id: null,
  author: { id: 1, name: 'Автор', avatar: '', role: 1 },
  text: '',
  created_at: '2026-11-04T10:00:00Z',
  updated_at: null,
  deleted: true,
  can_edit: false,
  can_delete: false,
  children: [],
};

describe('ArticleComment', () => {
  it('allows replying to a soft-deleted comment', async () => {
    const onReply = jest.fn().mockResolvedValue(undefined);

    render(
      <ArticleComment
        comment={comment}
        currentUserId={2}
        allowGuestTesting={false}
        onReply={onReply}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText('Комментарий удалён')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ответить' }));

    expect(screen.getByPlaceholderText(/Ответ на комментарий/)).toBeInTheDocument();
  });
});
