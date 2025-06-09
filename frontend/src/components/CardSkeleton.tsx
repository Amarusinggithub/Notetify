import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '../styles/note-card-skeleton.css';

type CardSkeleton = {
	cards: number;
};
const CardSkeleton = ({ cards }: CardSkeleton) => {
	return Array(cards)
		.fill(0)
		.map((_, i) => (
			<div className="card-skeleton" key={i}>
				<div className="right-col">
					<Skeleton count={4} style={{ marginBottom: '.6rem' }} />
				</div>
			</div>
		));
};

export default CardSkeleton;
