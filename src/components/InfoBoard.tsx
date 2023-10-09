export default function InfoBoard(props: {
  location: string;
  petsLength: number;
  adoptionLength: number;
}) {
  return (
    <div className='p-8' data-t='info-section'>
      <h2 className='text-2xl'> The game </h2>
      <p>WebSocket messages: 0</p>
      <p>
        {!props.petsLength ? (
          <span> No pets. Go rescue some pets!</span>
        ) : (
          <span>
            {' '}
            Pets in {props.location}: {props.petsLength}
          </span>
        )}
      </p>
      <p>
        {!props.adoptionLength ? (
          <span> No adoptions. Go get those pets adopted! </span>
        ) : (
          <span>
            {' '}
            Adoptions in {props.location}: {props.adoptionLength}
          </span>
        )}
      </p>
    </div>
  );
}
