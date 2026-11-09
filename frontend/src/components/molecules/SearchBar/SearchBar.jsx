import CustomInput from '../../atoms/TextField/CustomInput';
import CustomIconButton from '../../atoms/IconButton/CustomIconButton';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Buscar...',
}) {
  // Enter equivale a presionar la lupa
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSearch?.();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        border: '2px solid #000',
        borderRadius: '5px',
        width: '100%',
        backgroundColor: '#fff',
      }}
    >
      <CustomInput
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        slotProps={{ input: { 'aria-label': placeholder } }}
        sx={{
          border: 'none',
          ml: 0,
        }}
      />

      <CustomIconButton
        ariaLabel="Buscar"
        onClick={onSearch}
      >
        <SearchIcon />
      </CustomIconButton>
    </div>
  );
}

/*
  ============================
  EJEMPLO DE USO
  ============================
function App() {
  const [search, setSearch] = React.useState('');

  const handleSearch = () => {
    console.log('Buscando:', search);
  };

  return (
    <SearchBar
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      onSearch={handleSearch}
      placeholder="Buscar producto..."
    />
  );
}

export default App;
*/