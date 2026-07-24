import type { QuizItem } from '../data'
import { correctDisplayIndex } from '../data'

interface Props {
  item: QuizItem
  selected: number | null // display index the user picked
  reveal: boolean // show correct/incorrect colouring
  onSelect: (displayIndex: number) => void
  starred?: boolean
  onToggleStar?: () => void
  hideChoices?: boolean // learn mode: hide options until revealed
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function QuestionCard({
  item,
  selected,
  reveal,
  onSelect,
  starred,
  onToggleStar,
  hideChoices,
}: Props) {
  const correct = correctDisplayIndex(item)
  return (
    <div className="qcard">
      <div className="qhead">
        <div className="qtopic">{item.q.topic}</div>
        {onToggleStar && (
          <button
            type="button"
            className={`star${starred ? ' on' : ''}`}
            aria-label={starred ? 'Unstar question' : 'Star question'}
            onClick={onToggleStar}
          >
            {starred ? '★' : '☆'}
          </button>
        )}
      </div>
      <h2 className="qtext">{item.q.text}</h2>
      {item.q.image && (
        <img
          className="qdiagram"
          src={`${import.meta.env.BASE_URL}diagrams/${item.q.image}`}
          alt="Question diagram"
        />
      )}
      {!(hideChoices && !reveal) && (
        <ul className="choices">
          {item.order.map((_, di) => {
            const isSelected = selected === di
            const isCorrect = di === correct
            let cls = 'choice'
            if (reveal) {
              if (isCorrect) cls += ' correct'
              else if (isSelected) cls += ' wrong'
            } else if (isSelected) {
              cls += ' selected'
            }
            return (
              <li key={di}>
                <button
                  type="button"
                  className={cls}
                  disabled={reveal || hideChoices}
                  onClick={() => onSelect(di)}
                >
                  <span className="letter">{LETTERS[di]}</span>
                  <span className="ctext">{item.q.choices[item.order[di]]}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {reveal && item.q.explanation && (
        <div className="explbox">
          <span className="expllabel">Why</span>
          <p>{item.q.explanation}</p>
        </div>
      )}
    </div>
  )
}
