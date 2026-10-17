import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';

/*
 * Altura de cada elemento del menú.
 * Se utiliza para calcular la altura máxima
 * que puede alcanzar el menú desplegable.
 */
const ITEM_HEIGHT = 48;

/*
 * Espaciado superior del menú.
 */
const ITEM_PADDING_TOP = 8;

/*
 * Propiedades utilizadas para configurar
 * el menú desplegable del componente Select.
 *
 * Se establece una altura máxima para evitar
 * que el menú ocupe demasiado espacio en pantalla.
 */
const MenuProps = {
  slotProps: {
    paper: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  },
};

/*
 * CustomSelect
 *
 * Componente reutilizable basado en el componente
 * Select de Material UI.
 *
 * Permite crear listas desplegables con opciones
 * proporcionadas desde el componente padre.
 *
 * También permite seleccionar uno o varios elementos
 * mediante la propiedad multiple.
 *
 * @param {Array} options
 * Lista de opciones que aparecerán dentro del Select.
 *
 * Cada opción debe tener la siguiente estructura:
 *
 * {
 *   value: 'valor',
 *   label: 'Texto mostrado'
 * }
 *
 * @param {string|Array} value
 * Valor o valores actualmente seleccionados.
 *
 * Cuando multiple es false, recibe un único valor.
 * Cuando multiple es true, recibe un arreglo de valores.
 *
 * @param {Function} onChange
 * Función que se ejecuta cuando cambia la opción seleccionada.
 *
 * @param {string} placeholder
 * Texto que se muestra cuando no existe ninguna
 * opción seleccionada.
 *
 * @param {boolean} multiple
 * Determina si el usuario puede seleccionar una
 * o varias opciones.
 *
 * Por defecto es false.
 *
 * @param {'small'|'medium'|'large'} size
 * Define el tamaño del Select.
 *
 * @param {Object} sx
 * Permite agregar estilos personalizados al FormControl.
 *
 * @param {Object} props
 * Permite recibir otras propiedades compatibles
 * con el componente Select de Material UI.
 *
 * @returns {JSX.Element}
 * Retorna un Select personalizado y reutilizable.
 */
export default function CustomSelect({
  options = [],
  value = [],
  onChange,
  placeholder = 'Seleccionar...',
  multiple = false,
  size = 'medium',
  sx,
  ...props
}) {
  return (
    <FormControl sx={{ width: 300, ...sx }}>
      <Select
        multiple={multiple}
        displayEmpty
        value={value}
        onChange={onChange}
        size={size}
        input={<OutlinedInput />}
        MenuProps={MenuProps}
        renderValue={(selected) => {
          /*
           * Muestra el placeholder cuando no existe
           * ninguna opción seleccionada.
           */
          if (
            (multiple && selected.length === 0) ||
            (!multiple && !selected)
          ) {
            return <em>{placeholder}</em>;
          }

          /*
           * Cuando multiple es true, muestra todas
           * las opciones seleccionadas separadas por coma.
           *
           * Cuando multiple es false, muestra
           * únicamente la opción seleccionada.
           */
          return multiple
            ? selected.join(', ')
            : selected;
        }}
        {...props}
      >
        {/* Opción utilizada como placeholder */}
        <MenuItem disabled value={multiple ? [] : ''}>
          <em>{placeholder}</em>
        </MenuItem>

        {/* Genera las opciones recibidas mediante props */}
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}


/*
  ============================
  EJEMPLO DE USO
  ============================

  import * as React from 'react';
  import CustomSelect from './CustomSelect';

  const categorias = [
    {
      value: 'electronica',
      label: 'Electrónica',
    },
    {
      value: 'ropa',
      label: 'Ropa',
    },
    {
      value: 'hogar',
      label: 'Hogar',
    },
  ];

  function Example() {
    const [categoria, setCategoria] = React.useState('');

    const handleChange = (event) => {
      setCategoria(event.target.value);
    };

    return (
      <CustomSelect
        options={categorias}
        value={categoria}
        onChange={handleChange}
        placeholder="Seleccionar categoría"
      />
    );
  }


  ============================
  EJEMPLO CON MULTIPLE
  ============================

  const productos = [
    {
      value: 'producto1',
      label: 'Producto 1',
    },
    {
      value: 'producto2',
      label: 'Producto 2',
    },
    {
      value: 'producto3',
      label: 'Producto 3',
    },
  ];

  function ExampleMultiple() {
    const [productosSeleccionados, setProductosSeleccionados] =
      React.useState([]);

    const handleChange = (event) => {
      setProductosSeleccionados(event.target.value);
    };

    return (
      <CustomSelect
        options={productos}
        value={productosSeleccionados}
        onChange={handleChange}
        placeholder="Seleccionar productos"
        multiple
      />
    );
  }
*/